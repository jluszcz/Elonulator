// @vitest-environment happy-dom

/**
 * The API-failure path in loadBillionaireData. A separate file because
 * script.js wires itself up once on import, and this needs a failing fetch in
 * place before that happens.
 */
import { describe, test, expect, beforeAll, vi } from 'vitest';

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

beforeAll(async () => {
    document.body.innerHTML = PAGE_HTML;
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await import('../../public/script.js');
    await new Promise((resolve) => setTimeout(resolve, 0));
});

describe('loadBillionaireData failure', () => {
    test('shows an error the user can act on', () => {
        const error = document.getElementById('error');
        expect(error.style.display).toBe('block');
        expect(document.getElementById('error-message').textContent).toContain('refresh');
    });

    test('hides the loading indicator', () => {
        expect(document.getElementById('loading').style.display).toBe('none');
    });

    test('logs the underlying cause for debugging', () => {
        expect(console.error).toHaveBeenCalled();
    });
});
