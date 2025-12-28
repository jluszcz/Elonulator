// Import shared utility functions
import { formatCurrency, formatNumber, formatNumberWithCommas } from './utils.js';

// Utility: Debounce function to limit calculation frequency
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// State
let billionairesData = null;
let medianNetWorth = 0;
let selectedBillionaire = null;
let calculationDirection = 'billionaire-to-median'; // or 'median-to-billionaire'

// DOM Elements
const billionaireSelect = document.getElementById('billionaire-select');
const billionaireNetWorthInput = document.getElementById('billionaire-net-worth');
const medianNetWorthInput = document.getElementById('median-net-worth');
const billionaireAmountInput = document.getElementById('billionaire-amount');
const medianAmericanAmountInput = document.getElementById('median-american-amount');
const swapDirectionBtn = document.getElementById('swap-direction');
const comparisonTextEl = document.getElementById('comparison-text');
const comparisonMessageEl = document.getElementById('comparison-message');
const lastUpdatedEl = document.getElementById('last-updated');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMessageEl = document.getElementById('error-message');

function showError(message) {
    errorMessageEl.textContent = message;
    errorEl.style.display = 'block';
    loadingEl.style.display = 'none';
}

function hideError() {
    errorEl.style.display = 'none';
}

// Load billionaire data from API
async function loadBillionaireData() {
    try {
        loadingEl.style.display = 'block';
        hideError();

        const response = await fetch('/api/billionaires');

        if (!response.ok) {
            throw new Error('Failed to load billionaire data');
        }

        const data = await response.json();
        billionairesData = data.billionaires;
        medianNetWorth = data.medianAmericanNetWorth;

        // Update last updated date
        lastUpdatedEl.textContent = data.lastUpdated;

        // Display median net worth with commas
        medianNetWorthInput.value = formatNumberWithCommas(medianNetWorth);

        // Populate dropdown
        billionaireSelect.innerHTML = '<option value="">Select a billionaire...</option>';
        billionairesData.forEach((billionaire, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${billionaire.name} - ${formatCurrency(billionaire.netWorth)}`;
            billionaireSelect.appendChild(option);
        });

        // Auto-select Elon Musk (first in list)
        billionaireSelect.value = 0;
        handleBillionaireSelection();

        loadingEl.style.display = 'none';
    } catch (error) {
        console.error('Error loading billionaire data:', error);
        showError('Failed to load billionaire data. Please refresh the page to try again.');
    }
}

// Handle billionaire selection
function handleBillionaireSelection() {
    const selectedIndex = billionaireSelect.value;

    if (selectedIndex === '') {
        selectedBillionaire = null;
        billionaireNetWorthInput.value = '';
        comparisonTextEl.style.display = 'none';
        return;
    }

    selectedBillionaire = billionairesData[selectedIndex];
    billionaireNetWorthInput.value = formatNumberWithCommas(selectedBillionaire.netWorth);

    // Recalculate if there's already an amount entered
    if (billionaireAmountInput.value) {
        calculateEquivalent();
    }
}

// Swap calculation direction
function swapDirection() {
    calculationDirection = calculationDirection === 'billionaire-to-median'
        ? 'median-to-billionaire'
        : 'billionaire-to-median';

    // Update readonly states
    if (calculationDirection === 'billionaire-to-median') {
        billionaireAmountInput.removeAttribute('readonly');
        medianAmericanAmountInput.setAttribute('readonly', 'readonly');
        billionaireAmountInput.style.backgroundColor = '';
        medianAmericanAmountInput.style.backgroundColor = '#f8f9fa';
    } else {
        billionaireAmountInput.setAttribute('readonly', 'readonly');
        medianAmericanAmountInput.removeAttribute('readonly');
        billionaireAmountInput.style.backgroundColor = '#f8f9fa';
        medianAmericanAmountInput.style.backgroundColor = '';
    }

    // Recalculate
    calculateEquivalent();
}

// Calculate the equivalent amount based on direction
function calculateEquivalent() {
    if (!selectedBillionaire) {
        billionaireAmountInput.value = '';
        medianAmericanAmountInput.value = '';
        comparisonTextEl.style.display = 'none';
        return;
    }

    // Get current net worth values from inputs (remove commas)
    const billionaireNetWorth = parseFloat(billionaireNetWorthInput.value.replace(/[^0-9.]/g, ''));
    const currentMedianNetWorth = parseFloat(medianNetWorthInput.value.replace(/[^0-9.]/g, ''));

    if (isNaN(billionaireNetWorth) || isNaN(currentMedianNetWorth)) {
        comparisonTextEl.style.display = 'none';
        return;
    }

    if (calculationDirection === 'billionaire-to-median') {
        // Calculate median amount from billionaire amount
        const cleanValue = billionaireAmountInput.value.replace(/[^0-9.]/g, '');
        const billionaireAmount = parseFloat(cleanValue);

        if (isNaN(billionaireAmount) || billionaireAmount <= 0) {
            medianAmericanAmountInput.value = '';
            comparisonTextEl.style.display = 'none';
            return;
        }

        const ratio = billionaireAmount / billionaireNetWorth;
        const equivalentAmount = ratio * currentMedianNetWorth;

        medianAmericanAmountInput.value = formatNumber(equivalentAmount);
        updateComparisonText(billionaireAmount, equivalentAmount, billionaireNetWorth, currentMedianNetWorth);
    } else {
        // Calculate billionaire amount from median amount
        const cleanValue = medianAmericanAmountInput.value.replace(/[^0-9.]/g, '');
        const medianAmount = parseFloat(cleanValue);

        if (isNaN(medianAmount) || medianAmount <= 0) {
            billionaireAmountInput.value = '';
            comparisonTextEl.style.display = 'none';
            return;
        }

        const ratio = medianAmount / currentMedianNetWorth;
        const equivalentAmount = ratio * billionaireNetWorth;

        billionaireAmountInput.value = formatNumber(equivalentAmount);
        updateComparisonText(equivalentAmount, medianAmount, billionaireNetWorth, currentMedianNetWorth);
    }
}

// Create debounced version of calculateEquivalent for input handlers
const debouncedCalculateEquivalent = debounce(calculateEquivalent, 200);

// Update the comparison text with context
function updateComparisonText(billionaireAmount, medianAmount, billionaireNetWorth, currentMedianNetWorth) {
    if (calculationDirection === 'billionaire-to-median') {
        const percentageOfWealth = (billionaireAmount / billionaireNetWorth * 100).toFixed(1);
        let message = `${selectedBillionaire.name} spending ${formatCurrency(billionaireAmount)} `;
        message += `(${percentageOfWealth}% of their wealth) is like `;
        message += `the median American spending ${formatCurrency(medianAmount)}.`;
        comparisonMessageEl.textContent = message;
    } else {
        const percentageOfWealth = (medianAmount / currentMedianNetWorth * 100).toFixed(1);
        let message = `The median American spending ${formatCurrency(medianAmount)} `;
        message += `(${percentageOfWealth}% of their wealth) is like `;
        message += `${selectedBillionaire.name} spending ${formatCurrency(billionaireAmount)}.`;
        comparisonMessageEl.textContent = message;
    }

    comparisonTextEl.style.display = 'block';
}

// Format billionaire amount input with commas as user types
function formatBillionaireAmountInput() {
    if (billionaireAmountInput.hasAttribute('readonly')) return;

    const cursorPosition = billionaireAmountInput.selectionStart;
    const oldValue = billionaireAmountInput.value;
    const oldLength = oldValue.length;

    const cleanValue = oldValue.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let formattedValue = integerPart;
    if (parts.length > 1) {
        formattedValue += '.' + (decimalPart || '');
    }

    billionaireAmountInput.value = formattedValue;

    const newLength = formattedValue.length;
    const lengthDiff = newLength - oldLength;
    const newCursorPosition = cursorPosition + lengthDiff;
    billionaireAmountInput.setSelectionRange(newCursorPosition, newCursorPosition);

    debouncedCalculateEquivalent();
}

// Format median American amount input with commas as user types
function formatMedianAmountInput() {
    if (medianAmericanAmountInput.hasAttribute('readonly')) return;

    const cursorPosition = medianAmericanAmountInput.selectionStart;
    const oldValue = medianAmericanAmountInput.value;
    const oldLength = oldValue.length;

    const cleanValue = oldValue.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let formattedValue = integerPart;
    if (parts.length > 1) {
        formattedValue += '.' + (decimalPart || '');
    }

    medianAmericanAmountInput.value = formattedValue;

    const newLength = formattedValue.length;
    const lengthDiff = newLength - oldLength;
    const newCursorPosition = cursorPosition + lengthDiff;
    medianAmericanAmountInput.setSelectionRange(newCursorPosition, newCursorPosition);

    debouncedCalculateEquivalent();
}

// Format net worth inputs with commas
function formatNetWorthInputs() {
    // Format billionaire net worth
    const billionaireValue = billionaireNetWorthInput.value.replace(/[^0-9.]/g, '');
    if (billionaireValue) {
        const parts = billionaireValue.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        billionaireNetWorthInput.value = parts.join('.');
    }

    // Format median net worth
    const medianValue = medianNetWorthInput.value.replace(/[^0-9.]/g, '');
    if (medianValue) {
        const parts = medianValue.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        medianNetWorthInput.value = parts.join('.');
    }

    // Recalculate if there's an amount
    if (billionaireAmountInput.value) {
        debouncedCalculateEquivalent();
    }
}

// Event listeners
billionaireSelect.addEventListener('change', handleBillionaireSelection);
// Input formatting happens immediately, but calculations are debounced
billionaireAmountInput.addEventListener('input', formatBillionaireAmountInput);
medianAmericanAmountInput.addEventListener('input', formatMedianAmountInput);
billionaireNetWorthInput.addEventListener('input', formatNetWorthInputs);
medianNetWorthInput.addEventListener('input', formatNetWorthInputs);
swapDirectionBtn.addEventListener('click', swapDirection);

// Initialize readonly state
medianAmericanAmountInput.setAttribute('readonly', 'readonly');
medianAmericanAmountInput.style.backgroundColor = '#f8f9fa';

// Load data on page load
loadBillionaireData();
