// Import shared utility functions
import { formatCurrency, formatNumber, formatNumberWithCommas, addThousandsSeparators } from './utils.js';
import {
    calculateMedianEquivalent,
    calculateBillionaireEquivalent,
    calculatePercentageOfWealth,
} from './calc.js';

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

// Dropdown option value for a hand-entered net worth
const CUSTOM_OPTION_VALUE = 'custom';
const ONE_BILLION = 1000000000;

// DOM Elements
const billionaireSelect = document.getElementById('billionaire-select');
const billionaireNetWorthInput = document.getElementById('billionaire-net-worth');
const medianNetWorthInput = document.getElementById('median-net-worth');
const billionaireAmountInput = document.getElementById('billionaire-amount');
const medianAmericanAmountInput = document.getElementById('median-american-amount');
const swapDirectionBtn = document.getElementById('swap-direction');
const medianNetWorthLabel = document.getElementById('median-net-worth-label');
const medianAmountLabel = document.getElementById('median-amount-label');
const billionaireAmountLabel = document.getElementById('billionaire-amount-label');
const descriptionEl = document.getElementById('calculator-description');
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

// Parse a formatted input value ("1,000,000") into a number
function parseInputValue(inputElement) {
    return parseFloat(inputElement.value.replace(/[^0-9.]/g, ''));
}

// Whether the median net worth input differs from the loaded median value
function isCustomMedian() {
    const value = parseInputValue(medianNetWorthInput);
    return !isNaN(value) && value !== medianNetWorth;
}

function billionaireTier() {
    const value = parseInputValue(billionaireNetWorthInput);
    return !isNaN(value) && value > 0 && value < ONE_BILLION ? 'Millionaire' : 'Billionaire';
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// How to refer to the billionaire in sentences: their name, or a generic
// term when a custom net worth is entered
function billionaireSubject() {
    if (selectedBillionaire) {
        return selectedBillionaire.name;
    }
    return `this ${billionaireTier().toLowerCase()}`;
}

function medianSubject() {
    return isCustomMedian() ? 'someone with the custom net worth' : 'the median American';
}

function updateLabels() {
    const customMedian = isCustomMedian();
    medianNetWorthLabel.textContent = customMedian ? 'Custom Net Worth' : 'Median American Net Worth';
    medianAmountLabel.textContent = customMedian
        ? 'Equivalent for Custom Net Worth'
        : 'Equivalent for Median American';
    billionaireAmountLabel.textContent = `Amount for ${billionaireTier()}`;
    updateDescription();
}

function updateDescription() {
    const tier = billionaireTier().toLowerCase();
    if (calculationDirection === 'billionaire-to-median') {
        descriptionEl.textContent =
            `Enter an amount the ${tier} might spend, and see what that ` +
            `amount would be equivalent to for ${medianSubject()}.`;
    } else {
        descriptionEl.textContent =
            `Enter an amount ${medianSubject()} might spend, and see what that ` +
            `amount would be equivalent to for the ${tier}.`;
    }
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

        // Selected automatically when the user edits Their Net Worth by hand
        const customOption = document.createElement('option');
        customOption.value = CUSTOM_OPTION_VALUE;
        customOption.textContent = 'Custom';
        billionaireSelect.appendChild(customOption);

        // Auto-select Elon Musk (first in list); option values are strings
        billionaireSelect.value = '0';
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
        billionaireAmountInput.value = '';
        medianAmericanAmountInput.value = '';
        comparisonTextEl.style.display = 'none';
        updateLabels();
        return;
    }

    if (selectedIndex === CUSTOM_OPTION_VALUE) {
        // Keep whatever net worth is in the input as the custom value
        selectedBillionaire = null;
    } else {
        selectedBillionaire = billionairesData[selectedIndex];
        billionaireNetWorthInput.value = formatNumberWithCommas(selectedBillionaire.netWorth);
    }

    updateLabels();

    // calculateEquivalent handles empty inputs, so recalculate unconditionally
    calculateEquivalent();
}

// Swap calculation direction
function swapDirection() {
    calculationDirection =
        calculationDirection === 'billionaire-to-median' ? 'median-to-billionaire' : 'billionaire-to-median';

    // Update readonly states (CSS handles styling via input[readonly] selector)
    if (calculationDirection === 'billionaire-to-median') {
        billionaireAmountInput.removeAttribute('readonly');
        medianAmericanAmountInput.setAttribute('readonly', 'readonly');
    } else {
        billionaireAmountInput.setAttribute('readonly', 'readonly');
        medianAmericanAmountInput.removeAttribute('readonly');
    }
    updateDescription();

    // Recalculate
    calculateEquivalent();
}

// Calculate the equivalent amount based on direction
function calculateEquivalent() {
    if (billionaireSelect.value === '') {
        // Deselection already cleared the amount fields; don't wipe anything
        // the user has typed since then
        comparisonTextEl.style.display = 'none';
        return;
    }

    // Get current net worth values from inputs (remove commas)
    const billionaireNetWorth = parseInputValue(billionaireNetWorthInput);
    const currentMedianNetWorth = parseInputValue(medianNetWorthInput);

    if (
        isNaN(billionaireNetWorth) ||
        billionaireNetWorth <= 0 ||
        isNaN(currentMedianNetWorth) ||
        currentMedianNetWorth <= 0
    ) {
        // Clear the computed output so a stale equivalent doesn't linger
        if (calculationDirection === 'billionaire-to-median') {
            medianAmericanAmountInput.value = '';
        } else {
            billionaireAmountInput.value = '';
        }
        comparisonTextEl.style.display = 'none';
        return;
    }

    if (calculationDirection === 'billionaire-to-median') {
        // Calculate median amount from billionaire amount
        const billionaireAmount = parseInputValue(billionaireAmountInput);

        if (isNaN(billionaireAmount) || billionaireAmount <= 0) {
            medianAmericanAmountInput.value = '';
            comparisonTextEl.style.display = 'none';
            return;
        }

        const equivalentAmount = calculateMedianEquivalent(
            billionaireAmount,
            billionaireNetWorth,
            currentMedianNetWorth,
        );

        medianAmericanAmountInput.value = formatNumber(equivalentAmount);
        updateComparisonText(billionaireAmount, equivalentAmount, billionaireNetWorth, currentMedianNetWorth);
    } else {
        // Calculate billionaire amount from median amount
        const medianAmount = parseInputValue(medianAmericanAmountInput);

        if (isNaN(medianAmount) || medianAmount <= 0) {
            billionaireAmountInput.value = '';
            comparisonTextEl.style.display = 'none';
            return;
        }

        const equivalentAmount = calculateBillionaireEquivalent(
            medianAmount,
            currentMedianNetWorth,
            billionaireNetWorth,
        );

        billionaireAmountInput.value = formatNumber(equivalentAmount);
        updateComparisonText(equivalentAmount, medianAmount, billionaireNetWorth, currentMedianNetWorth);
    }
}

// Create debounced version of calculateEquivalent for input handlers
const debouncedCalculateEquivalent = debounce(calculateEquivalent, 200);

// Update the comparison text with context
function updateComparisonText(billionaireAmount, medianAmount, billionaireNetWorth, currentMedianNetWorth) {
    if (calculationDirection === 'billionaire-to-median') {
        const percentageOfWealth = calculatePercentageOfWealth(billionaireAmount, billionaireNetWorth);
        let message = `${capitalize(billionaireSubject())} spending ${formatCurrency(billionaireAmount)} `;
        message += `(${percentageOfWealth}% of their wealth) is like `;
        message += `${medianSubject()} spending ${formatCurrency(medianAmount)}.`;
        comparisonMessageEl.textContent = message;
    } else {
        const percentageOfWealth = calculatePercentageOfWealth(medianAmount, currentMedianNetWorth);
        let message = `${capitalize(medianSubject())} spending ${formatCurrency(medianAmount)} `;
        message += `(${percentageOfWealth}% of their wealth) is like `;
        message += `${billionaireSubject()} spending ${formatCurrency(billionaireAmount)}.`;
        comparisonMessageEl.textContent = message;
    }

    comparisonTextEl.style.display = 'block';
}

// Shared function to format input with commas as user types
function formatInputWithCommas(inputElement) {
    if (inputElement.hasAttribute('readonly')) return;

    const cursorPosition = inputElement.selectionStart;
    const oldValue = inputElement.value;
    const oldLength = oldValue.length;

    const cleanValue = oldValue.replace(/[^0-9.]/g, '');
    const formattedValue = addThousandsSeparators(cleanValue);

    inputElement.value = formattedValue;

    const newLength = formattedValue.length;
    const lengthDiff = newLength - oldLength;
    const newCursorPosition = cursorPosition + lengthDiff;
    inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

    debouncedCalculateEquivalent();
}

// Format billionaire amount input with commas as user types
function formatBillionaireAmountInput() {
    formatInputWithCommas(billionaireAmountInput);
}

// Format median American amount input with commas as user types
function formatMedianAmountInput() {
    formatInputWithCommas(medianAmericanAmountInput);
}

// Format net worth inputs with commas
function formatNetWorthInputs() {
    // Format billionaire net worth
    const billionaireValue = billionaireNetWorthInput.value.replace(/[^0-9.]/g, '');
    if (billionaireValue) {
        billionaireNetWorthInput.value = addThousandsSeparators(billionaireValue);
    }

    // Format median net worth
    const medianValue = medianNetWorthInput.value.replace(/[^0-9.]/g, '');
    if (medianValue) {
        medianNetWorthInput.value = addThousandsSeparators(medianValue);
    }

    // Editing the billionaire's net worth away from the selected billionaire's
    // value switches the dropdown to Custom, as does typing a net worth while
    // no billionaire is selected. Compare display strings: fractional net
    // worths (e.g. 4.1B) round on display, so the parsed value never matches.
    const editedAwayFromSelection =
        selectedBillionaire &&
        billionaireNetWorthInput.value !== formatNumberWithCommas(selectedBillionaire.netWorth);
    const typedWithoutSelection = billionaireSelect.value === '' && billionaireNetWorthInput.value !== '';
    if (editedAwayFromSelection || typedWithoutSelection) {
        selectedBillionaire = null;
        billionaireSelect.value = CUSTOM_OPTION_VALUE;
    }

    updateLabels();
    debouncedCalculateEquivalent();
}

// Event listeners
billionaireSelect.addEventListener('change', handleBillionaireSelection);
// Input formatting happens immediately, but calculations are debounced
billionaireAmountInput.addEventListener('input', formatBillionaireAmountInput);
medianAmericanAmountInput.addEventListener('input', formatMedianAmountInput);
billionaireNetWorthInput.addEventListener('input', formatNetWorthInputs);
medianNetWorthInput.addEventListener('input', formatNetWorthInputs);
swapDirectionBtn.addEventListener('click', swapDirection);

// Initialize readonly state (CSS handles styling via input[readonly] selector)
medianAmericanAmountInput.setAttribute('readonly', 'readonly');

// Load data on page load
loadBillionaireData();

// Theme toggle
const SUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
const MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

const themeBtn = document.getElementById('theme-btn');
const storedTheme = () => localStorage.getItem('theme');
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
const getTheme = () => {
    const s = storedTheme();
    if (s === 'light' || s === 'dark') return s;
    return systemDark() ? 'dark' : 'light';
};

const applyTheme = (theme, persist = false) => {
    document.documentElement.dataset.theme = theme;
    if (persist) localStorage.setItem('theme', theme);
    const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    themeBtn.title = label;
    themeBtn.setAttribute('aria-label', label);
    themeBtn.innerHTML = theme === 'dark' ? SUN_SVG : MOON_SVG;
};

themeBtn.addEventListener('click', () => applyTheme(getTheme() === 'dark' ? 'light' : 'dark', true));
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!storedTheme()) applyTheme(e.matches ? 'dark' : 'light');
});
applyTheme(getTheme());
