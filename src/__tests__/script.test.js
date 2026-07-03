// @vitest-environment happy-dom

/**
 * Smoke tests for the browser entry point (public/script.js). These exercise
 * the DOM wiring around calculateEquivalent end-to-end: data load, both
 * calculation directions, and clearing stale output on invalid input.
 */
import { describe, test, expect, beforeAll, vi } from 'vitest';

const API_DATA = {
    billionaires: [
        { name: 'Test Billionaire', netWorth: 1000000000, source: 'Testing' },
        { name: 'Second Billionaire', netWorth: 500000000, source: 'Also Testing' }
    ],
    medianAmericanNetWorth: 100000,
    lastUpdated: '2026-01-01'
};

// Minimal markup with the elements script.js wires up on import
const PAGE_HTML = `
    <select id="billionaire-select"></select>
    <input id="billionaire-net-worth">
    <input id="median-net-worth">
    <input id="billionaire-amount">
    <input id="median-american-amount">
    <button id="swap-direction"></button>
    <p id="calculator-description"></p>
    <div id="comparison-text"><p id="comparison-message"></p></div>
    <span id="last-updated"></span>
    <div id="loading"></div>
    <div id="error"><p id="error-message"></p></div>
    <button id="theme-btn"></button>
`;

let select;
let billionaireNetWorth;
let medianNetWorth;
let billionaireAmount;
let medianAmount;
let comparisonText;
let comparisonMessage;

function recalculate() {
    // Selection change runs calculateEquivalent synchronously, bypassing the
    // debounced input handlers
    select.dispatchEvent(new Event('change'));
}

beforeAll(async () => {
    document.body.innerHTML = PAGE_HTML;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => API_DATA
    }));
    // Node's experimental localStorage global shadows happy-dom's; the theme
    // toggle needs one that works
    vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => null),
        setItem: vi.fn()
    });

    await import('../../public/script.js');
    // Let the async data load settle
    await new Promise(resolve => setTimeout(resolve, 0));

    select = document.getElementById('billionaire-select');
    billionaireNetWorth = document.getElementById('billionaire-net-worth');
    medianNetWorth = document.getElementById('median-net-worth');
    billionaireAmount = document.getElementById('billionaire-amount');
    medianAmount = document.getElementById('median-american-amount');
    comparisonText = document.getElementById('comparison-text');
    comparisonMessage = document.getElementById('comparison-message');
});

describe('page load', () => {
    test('populates the dropdown and auto-selects the first billionaire', () => {
        expect(select.options).toHaveLength(3); // placeholder + 2 billionaires
        expect(select.value).toBe('0');
        expect(billionaireNetWorth.value).toBe('1,000,000,000');
        expect(medianNetWorth.value).toBe('100,000');
    });

    test('shows the last updated date from the API', () => {
        expect(document.getElementById('last-updated').textContent).toBe('2026-01-01');
    });
});

describe('billionaire-to-median calculation', () => {
    test('computes the median equivalent of a billionaire amount', () => {
        // 100M of a 1B net worth is 10%, so 10% of 100k median = 10,000
        billionaireAmount.value = '100,000,000';
        recalculate();

        expect(medianAmount.value).toBe('10,000.00');
        expect(comparisonText.style.display).toBe('block');
        expect(comparisonMessage.textContent).toBe(
            'Test Billionaire spending $100.00 million (10.0% of their wealth) '
            + 'is like the median American spending $10.00 thousand.'
        );
    });

    test('clears the computed output when the amount is emptied', () => {
        billionaireAmount.value = '';
        recalculate();

        expect(medianAmount.value).toBe('');
        expect(comparisonText.style.display).toBe('none');
    });

    test('clears stale output when a net worth becomes invalid', () => {
        billionaireAmount.value = '100,000,000';
        recalculate();
        expect(medianAmount.value).toBe('10,000.00');

        medianNetWorth.value = '0';
        recalculate();

        expect(medianAmount.value).toBe('');
        expect(comparisonText.style.display).toBe('none');

        medianNetWorth.value = '100,000';
    });
});

describe('median-to-billionaire calculation', () => {
    test('swapping direction flips readonly state and recalculates from the median amount', () => {
        medianAmount.value = '10,000';
        document.getElementById('swap-direction').click();

        expect(billionaireAmount.hasAttribute('readonly')).toBe(true);
        expect(medianAmount.hasAttribute('readonly')).toBe(false);

        // 10k of a 100k net worth is 10%, so 10% of 1B = 100M
        expect(billionaireAmount.value).toBe('100,000,000.00');
        expect(comparisonMessage.textContent).toBe(
            'The median American spending $10.00 thousand (10.0% of their wealth) '
            + 'is like Test Billionaire spending $100.00 million.'
        );
    });
});

describe('deselection', () => {
    test('hides the comparison and clears inputs without wiping later typing', () => {
        select.value = '';
        recalculate();

        expect(billionaireNetWorth.value).toBe('');
        expect(billionaireAmount.value).toBe('');
        expect(medianAmount.value).toBe('');
        expect(comparisonText.style.display).toBe('none');
    });
});
