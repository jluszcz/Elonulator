import { describe, test, expect } from 'vitest';

import {
    calculateMedianEquivalent,
    calculateBillionaireEquivalent,
    calculatePercentageOfWealth
} from '../../public/calc.js';

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
        expect(() => calculateMedianEquivalent(1000, 0, 1000)).toThrow('Net worths must be positive');
        expect(() => calculateMedianEquivalent(1000, 1000, 0)).toThrow('Net worths must be positive');
    });

    test('handles zero amount correctly', () => {
        const result = calculateMedianEquivalent(0, 744000000000, 193000);
        expect(result).toBe(0);
    });

    test('throws error for negative values', () => {
        expect(() => calculateMedianEquivalent(-100, 1000, 1000)).toThrow('Amount must be non-negative');
        expect(() => calculateMedianEquivalent(100, -1000, 1000)).toThrow('Net worths must be positive');
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
        expect(() => calculateBillionaireEquivalent(1000, 0, 1000)).toThrow('Net worths must be positive');
        expect(() => calculateBillionaireEquivalent(1000, 1000, 0)).toThrow('Net worths must be positive');
    });

    test('handles zero amount correctly', () => {
        const result = calculateBillionaireEquivalent(0, 193000, 744000000000);
        expect(result).toBe(0);
    });

    test('throws error for negative values', () => {
        expect(() => calculateBillionaireEquivalent(-100, 1000, 1000)).toThrow('Amount must be non-negative');
        expect(() => calculateBillionaireEquivalent(100, -1000, 1000)).toThrow('Net worths must be positive');
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
