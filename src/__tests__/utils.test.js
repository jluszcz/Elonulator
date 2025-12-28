// Import formatting functions from public/utils.js
import {
    formatCurrency,
    formatNumber,
    formatNumberWithCommas
} from '../../public/utils.js';

// Import calculation functions from src/utils.js
import {
    calculateMedianEquivalent,
    calculateBillionaireEquivalent,
    calculatePercentageOfWealth
} from '../utils.js';

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

describe('calculateMedianEquivalent', () => {
    test('calculates correct equivalent amount', () => {
        // If billionaire spends $100B out of $744B net worth (13.44%)
        // Median American equivalent: $193,000 * (100B / 744B) = $25,940.86
        const result = calculateMedianEquivalent(100000000000, 744000000000, 193000);
        expect(result).toBeCloseTo(25940.86, 2);
    });

    test('calculates small percentages correctly', () => {
        // Billionaire spends $1M out of $744B (0.000134%)
        // Median equivalent: $193,000 * 0.00000134 = $0.26
        const result = calculateMedianEquivalent(1000000, 744000000000, 193000);
        expect(result).toBeCloseTo(0.26, 2);
    });

    test('throws error for missing parameters', () => {
        expect(() => calculateMedianEquivalent(null, 1000, 1000)).toThrow('All parameters are required');
        expect(() => calculateMedianEquivalent(1000, null, 1000)).toThrow('All parameters are required');
        expect(() => calculateMedianEquivalent(1000, 1000, undefined)).toThrow('All parameters are required');
    });

    test('throws error for zero net worth values', () => {
        expect(() => calculateMedianEquivalent(1000, 0, 1000)).toThrow('All values must be positive');
        expect(() => calculateMedianEquivalent(1000, 1000, 0)).toThrow('All values must be positive');
    });

    test('handles zero amount correctly', () => {
        const result = calculateMedianEquivalent(0, 744000000000, 193000);
        expect(result).toBe(0);
    });

    test('throws error for negative values', () => {
        expect(() => calculateMedianEquivalent(-100, 1000, 1000)).toThrow('All values must be positive');
        expect(() => calculateMedianEquivalent(100, -1000, 1000)).toThrow('All values must be positive');
    });
});

describe('calculateBillionaireEquivalent', () => {
    test('calculates correct equivalent amount', () => {
        // If median American spends $1,000 out of $193,000 net worth (0.518%)
        // Billionaire equivalent: $744B * (1000 / 193000) = $3.854B
        const result = calculateBillionaireEquivalent(1000, 193000, 744000000000);
        expect(result).toBeCloseTo(3854922279.79, 2);
    });

    test('calculates large percentages correctly', () => {
        // Median American spends $50,000 out of $193,000 (25.9%)
        // Billionaire equivalent: $744B * 0.259 = $192.75B
        const result = calculateBillionaireEquivalent(50000, 193000, 744000000000);
        expect(result).toBeCloseTo(192746113989.64, 2);
    });

    test('throws error for missing parameters', () => {
        expect(() => calculateBillionaireEquivalent(null, 1000, 1000)).toThrow('All parameters are required');
        expect(() => calculateBillionaireEquivalent(1000, null, 1000)).toThrow('All parameters are required');
        expect(() => calculateBillionaireEquivalent(1000, 1000, undefined)).toThrow('All parameters are required');
    });

    test('throws error for zero net worth values', () => {
        expect(() => calculateBillionaireEquivalent(1000, 0, 1000)).toThrow('All values must be positive');
        expect(() => calculateBillionaireEquivalent(1000, 1000, 0)).toThrow('All values must be positive');
    });

    test('handles zero amount correctly', () => {
        const result = calculateBillionaireEquivalent(0, 193000, 744000000000);
        expect(result).toBe(0);
    });

    test('throws error for negative values', () => {
        expect(() => calculateBillionaireEquivalent(-100, 1000, 1000)).toThrow('All values must be positive');
        expect(() => calculateBillionaireEquivalent(100, -1000, 1000)).toThrow('All values must be positive');
    });
});

describe('calculatePercentageOfWealth', () => {
    test('calculates percentage correctly', () => {
        expect(calculatePercentageOfWealth(100000000000, 744000000000)).toBe('13.4');
        expect(calculatePercentageOfWealth(1000, 193000)).toBe('0.5');
    });

    test('handles very small percentages', () => {
        expect(calculatePercentageOfWealth(1, 744000000000)).toBe('0.0');
        expect(calculatePercentageOfWealth(1000000, 744000000000)).toBe('0.0');
    });

    test('handles 100% and above', () => {
        expect(calculatePercentageOfWealth(1000, 1000)).toBe('100.0');
        expect(calculatePercentageOfWealth(2000, 1000)).toBe('200.0');
    });

    test('throws error for missing parameters', () => {
        expect(() => calculatePercentageOfWealth(null, 1000)).toThrow('Both parameters are required');
        expect(() => calculatePercentageOfWealth(1000, null)).toThrow('Both parameters are required');
        expect(() => calculatePercentageOfWealth(undefined, undefined)).toThrow('Both parameters are required');
    });

    test('throws error for zero total wealth', () => {
        expect(() => calculatePercentageOfWealth(1000, 0)).toThrow('Total wealth must be positive');
    });

    test('throws error for negative values', () => {
        expect(() => calculatePercentageOfWealth(100, -1000)).toThrow('Total wealth must be positive');
        expect(() => calculatePercentageOfWealth(-100, 1000)).toThrow('Amount must be non-negative');
    });

    test('handles zero amount correctly', () => {
        expect(calculatePercentageOfWealth(0, 1000)).toBe('0.0');
    });
});
