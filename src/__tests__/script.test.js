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
        // Written as the API computes it (billions * 1e9); 4.1 * 1e9 is a
        // non-integer double, which pins the display-string comparison in
        // formatNetWorthInputs
        { name: 'Second Billionaire', netWorth: 4.1 * 1000000000, source: 'Also Testing' },
    ],
    medianAmericanNetWorth: 100000,
    lastUpdated: '2026-01-01',
};

// Minimal markup with the elements script.js wires up on import
const PAGE_HTML = `
    <select id="billionaire-select"></select>
    <input id="billionaire-net-worth">
    <label id="median-net-worth-label">Median American Net Worth</label>
    <input id="median-net-worth">
    <label id="billionaire-amount-label">Amount for Billionaire</label>
    <input id="billionaire-amount">
    <button id="clear-billionaire-amount" hidden></button>
    <label id="median-amount-label">Equivalent for Median American</label>
    <input id="median-american-amount">
    <button id="clear-median-american-amount" hidden></button>
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

function typeInto(input, value) {
    input.value = value;
    input.dispatchEvent(new Event('input'));
}

function flushDebounce() {
    // Let the 200ms-debounced calculation from input events settle so it
    // can't fire mid-way through a later test
    return new Promise((resolve) => setTimeout(resolve, 250));
}

function labelText(id) {
    return document.getElementById(id).textContent;
}

beforeAll(async () => {
    document.body.innerHTML = PAGE_HTML;
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
            ok: true,
            json: async () => API_DATA,
        }),
    );
    // Node's experimental localStorage global shadows happy-dom's; the theme
    // toggle needs one that works
    vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
    });

    await import('../../public/script.js');
    // Let the async data load settle
    await new Promise((resolve) => setTimeout(resolve, 0));

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
        expect(select.options).toHaveLength(4); // placeholder + 2 billionaires + Custom
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
            'Test Billionaire spending $100.00 million (10.0% of their wealth) ' +
                'is like the median American spending $10.00 thousand.',
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

describe('inline clear button', () => {
    test('is hidden until the editable amount has a value', () => {
        const clearBtn = document.getElementById('clear-billionaire-amount');
        billionaireAmount.value = '';
        select.value = '0';
        recalculate();
        expect(clearBtn.hidden).toBe(true);

        typeInto(billionaireAmount, '100,000,000');
        expect(clearBtn.hidden).toBe(false);
    });

    test('clearing empties both amounts and hides the comparison without changing the selection', async () => {
        const clearBtn = document.getElementById('clear-billionaire-amount');
        typeInto(billionaireAmount, '100,000,000');
        recalculate();
        expect(medianAmount.value).toBe('10,000.00');
        expect(comparisonText.style.display).toBe('block');

        clearBtn.click();

        expect(billionaireAmount.value).toBe('');
        expect(medianAmount.value).toBe('');
        expect(comparisonText.style.display).toBe('none');
        expect(clearBtn.hidden).toBe(true);
        // Selection and net worths are left intact
        expect(select.value).toBe('0');
        expect(billionaireNetWorth.value).toBe('1,000,000,000');

        await flushDebounce();
    });

    test('never appears on the readonly computed field', () => {
        const computedClearBtn = document.getElementById('clear-median-american-amount');
        billionaireAmount.value = '100,000,000';
        select.value = '0';
        recalculate();

        // The computed median field now holds a value...
        expect(medianAmount.value).toBe('10,000.00');
        expect(medianAmount.hasAttribute('readonly')).toBe(true);
        // ...but as the readonly side it never offers a clear button
        expect(computedClearBtn.hidden).toBe(true);
    });

    test('re-hides once the editable amount is emptied by typing', async () => {
        const clearBtn = document.getElementById('clear-billionaire-amount');
        select.value = '0';
        recalculate();

        typeInto(billionaireAmount, '100,000,000');
        expect(clearBtn.hidden).toBe(false);

        typeInto(billionaireAmount, '');
        expect(clearBtn.hidden).toBe(true);

        await flushDebounce();
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
            'The median American spending $10.00 thousand (10.0% of their wealth) ' +
                'is like Test Billionaire spending $100.00 million.',
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

describe('custom median net worth', () => {
    test('relabels the median fields while customized and reverts when restored', async () => {
        // Restore billionaire-to-median direction from the earlier swap test
        document.getElementById('swap-direction').click();
        select.value = '0';
        recalculate();

        typeInto(medianNetWorth, '200,000');

        expect(labelText('median-net-worth-label')).toBe('Custom Net Worth');
        expect(labelText('median-amount-label')).toBe('Equivalent for Custom Net Worth');

        billionaireAmount.value = '100,000,000';
        recalculate();

        // 10% of the 200k custom net worth
        expect(medianAmount.value).toBe('20,000.00');
        expect(comparisonMessage.textContent).toBe(
            'Test Billionaire spending $100.00 million (10.0% of their wealth) ' +
                'is like someone with the custom net worth spending $20.00 thousand.',
        );

        typeInto(medianNetWorth, '100,000');

        expect(labelText('median-net-worth-label')).toBe('Median American Net Worth');
        expect(labelText('median-amount-label')).toBe('Equivalent for Median American');

        await flushDebounce();
    });
});

describe('custom billionaire net worth', () => {
    test('switches the dropdown to Custom and relabels for a millionaire net worth', async () => {
        select.value = '0';
        recalculate();

        typeInto(billionaireNetWorth, '500,000,000');

        expect(select.value).toBe('custom');
        expect(labelText('billionaire-amount-label')).toBe('Amount for Millionaire');

        billionaireAmount.value = '100,000,000';
        recalculate();

        // 20% of the 500M custom net worth applied to the 100k median
        expect(medianAmount.value).toBe('20,000.00');
        expect(comparisonMessage.textContent).toBe(
            'This millionaire spending $100.00 million (20.0% of their wealth) ' +
                'is like the median American spending $20.00 thousand.',
        );

        await flushDebounce();
    });

    test('re-selecting a billionaire restores their net worth, name, and label', () => {
        select.value = '0';
        recalculate();

        expect(billionaireNetWorth.value).toBe('1,000,000,000');
        expect(labelText('billionaire-amount-label')).toBe('Amount for Billionaire');
        expect(comparisonMessage.textContent).toContain('Test Billionaire');
    });

    test('typing a net worth with no billionaire selected switches to Custom and calculates', async () => {
        select.value = '';
        recalculate();

        typeInto(billionaireNetWorth, '2,000,000,000');

        expect(select.value).toBe('custom');
        expect(labelText('billionaire-amount-label')).toBe('Amount for Billionaire');

        billionaireAmount.value = '100,000,000';
        recalculate();

        // 5% of the 2B custom net worth applied to the 100k median
        expect(medianAmount.value).toBe('5,000.00');
        expect(comparisonMessage.textContent).toBe(
            'This billionaire spending $100.00 million (5.0% of their wealth) ' +
                'is like the median American spending $5.00 thousand.',
        );

        await flushDebounce();
    });

    test('describes custom subjects on both sides in the swapped direction', async () => {
        select.value = '0';
        recalculate();
        typeInto(billionaireNetWorth, '500,000,000');
        typeInto(medianNetWorth, '200,000');

        document.getElementById('swap-direction').click();
        medianAmount.value = '20,000';
        recalculate();

        // 10% of the 200k custom median applied to the 500M custom net worth
        expect(billionaireAmount.value).toBe('50,000,000.00');
        expect(comparisonMessage.textContent).toBe(
            'Someone with the custom net worth spending $20.00 thousand (10.0% of their wealth) ' +
                'is like this millionaire spending $50.00 million.',
        );

        // Restore direction and default median for later tests
        document.getElementById('swap-direction').click();
        typeInto(medianNetWorth, '100,000');
        await flushDebounce();
    });

    test('typing in the median input keeps a fractional-net-worth billionaire selected', async () => {
        select.value = '1';
        recalculate();

        expect(billionaireNetWorth.value).toBe('4,100,000,000');

        typeInto(medianNetWorth, '100,000');

        expect(select.value).toBe('1');
        expect(comparisonMessage.textContent).toContain('Second Billionaire');

        await flushDebounce();
    });
});
