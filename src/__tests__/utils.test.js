import { describe, test, expect } from 'vitest';

import {
    formatCurrency,
    formatNumber,
    formatNumberWithCommas,
    addThousandsSeparators,
} from '../../public/utils.js';

describe('formatCurrency', () => {
    test('formats billions correctly', () => {
        expect(formatCurrency(1000000000)).toBe('$1.00 billion');
        expect(formatCurrency(744000000000)).toBe('$744.00 billion');
        expect(formatCurrency(1500000000)).toBe('$1.50 billion');
    });

    test('formats millions correctly', () => {
        expect(formatCurrency(1000000)).toBe('$1.00 million');
        expect(formatCurrency(50000000)).toBe('$50.00 million');
        expect(formatCurrency(999999999)).toBe('$1000.00 million');
    });

    test('formats thousands correctly', () => {
        expect(formatCurrency(1000)).toBe('$1.00 thousand');
        expect(formatCurrency(50000)).toBe('$50.00 thousand');
        expect(formatCurrency(999999)).toBe('$1000.00 thousand');
    });

    test('formats small amounts correctly', () => {
        expect(formatCurrency(100)).toBe('$100.00');
        expect(formatCurrency(50.5)).toBe('$50.50');
        expect(formatCurrency(0)).toBe('$0.00');
    });

    test('handles negative numbers', () => {
        expect(formatCurrency(-1000000000)).toBe('$-1.00 billion');
        expect(formatCurrency(-1000000)).toBe('$-1.00 million');
        expect(formatCurrency(-1000)).toBe('$-1.00 thousand');
        expect(formatCurrency(-100)).toBe('$-100.00');
    });

    test('handles boundary values correctly', () => {
        // Just below billion threshold
        expect(formatCurrency(999999999)).toBe('$1000.00 million');
        // Exactly at billion threshold
        expect(formatCurrency(1000000000)).toBe('$1.00 billion');

        // Just below million threshold
        expect(formatCurrency(999999)).toBe('$1000.00 thousand');
        // Exactly at million threshold
        expect(formatCurrency(1000000)).toBe('$1.00 million');

        // Just below thousand threshold
        expect(formatCurrency(999)).toBe('$999.00');
        // Exactly at thousand threshold
        expect(formatCurrency(1000)).toBe('$1.00 thousand');
    });
});

describe('formatNumber', () => {
    test('formats numbers with 2 decimal places', () => {
        expect(formatNumber(1234.5678)).toBe('1,234.57');
        expect(formatNumber(1000000)).toBe('1,000,000.00');
        expect(formatNumber(0.1234)).toBe('0.12');
    });

    test('adds commas for thousands separator', () => {
        expect(formatNumber(1234567.89)).toBe('1,234,567.89');
        expect(formatNumber(999)).toBe('999.00');
    });
});

describe('formatNumberWithCommas', () => {
    test('formats numbers without decimal places', () => {
        expect(formatNumberWithCommas(1234567)).toBe('1,234,567');
        expect(formatNumberWithCommas(193000)).toBe('193,000');
        expect(formatNumberWithCommas(744000000000)).toBe('744,000,000,000');
    });

    test('rounds decimal values', () => {
        expect(formatNumberWithCommas(1234.56)).toBe('1,235');
        expect(formatNumberWithCommas(999.4)).toBe('999');
    });

    test('handles decimal inputs at boundaries', () => {
        // Test rounding up at .5
        expect(formatNumberWithCommas(999.5)).toBe('1,000');
        expect(formatNumberWithCommas(1000.5)).toBe('1,001');

        // Test rounding down below .5
        expect(formatNumberWithCommas(999.4)).toBe('999');
        expect(formatNumberWithCommas(1000.4)).toBe('1,000');

        // Test rounding up above .5
        expect(formatNumberWithCommas(999.6)).toBe('1,000');
        expect(formatNumberWithCommas(1000.6)).toBe('1,001');
    });

    test('handles edge cases with decimals', () => {
        expect(formatNumberWithCommas(0.1)).toBe('0');
        expect(formatNumberWithCommas(0.9)).toBe('1');
        expect(formatNumberWithCommas(0.5)).toBe('1');
    });
});

describe('addThousandsSeparators', () => {
    test('inserts commas into integer strings', () => {
        expect(addThousandsSeparators('1234567')).toBe('1,234,567');
        expect(addThousandsSeparators('193000')).toBe('193,000');
        expect(addThousandsSeparators('999')).toBe('999');
    });

    test('preserves decimal portion as typed', () => {
        expect(addThousandsSeparators('1234.5')).toBe('1,234.5');
        expect(addThousandsSeparators('1234.56')).toBe('1,234.56');
    });

    test('preserves a trailing decimal point while typing', () => {
        expect(addThousandsSeparators('1000.')).toBe('1,000.');
    });

    test('preserves text after a stray second decimal point', () => {
        expect(addThousandsSeparators('1.2.3')).toBe('1.2.3');
        expect(addThousandsSeparators('1234.5.6')).toBe('1,234.5.6');
    });

    test('handles empty string', () => {
        expect(addThousandsSeparators('')).toBe('');
    });
});
