/**
 * Utility functions for the Elonulator application
 */

/**
 * Format a number as currency with appropriate unit (billion, million, thousand)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
    if (amount >= 1000000000) {
        return `$${(amount / 1000000000).toFixed(2)} billion`;
    } else if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(2)} million`;
    } else if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(2)} thousand`;
    } else {
        return `$${amount.toFixed(2)}`;
    }
}

/**
 * Format a number with commas as thousands separator and 2 decimal places
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

/**
 * Format a number with commas as thousands separator (no decimal places)
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export function formatNumberWithCommas(num) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
}

/**
 * Calculate equivalent amount for median American based on billionaire spending
 * @param {number} billionaireAmount - Amount billionaire is spending
 * @param {number} billionaireNetWorth - Billionaire's total net worth
 * @param {number} medianNetWorth - Median American net worth
 * @returns {number} Equivalent amount for median American
 */
export function calculateMedianEquivalent(billionaireAmount, billionaireNetWorth, medianNetWorth) {
    if (!billionaireAmount || !billionaireNetWorth || !medianNetWorth) {
        throw new Error('All parameters are required');
    }
    if (billionaireAmount < 0 || billionaireNetWorth <= 0 || medianNetWorth <= 0) {
        throw new Error('All values must be positive');
    }

    const ratio = billionaireAmount / billionaireNetWorth;
    return ratio * medianNetWorth;
}

/**
 * Calculate equivalent amount for billionaire based on median American spending
 * @param {number} medianAmount - Amount median American is spending
 * @param {number} medianNetWorth - Median American net worth
 * @param {number} billionaireNetWorth - Billionaire's total net worth
 * @returns {number} Equivalent amount for billionaire
 */
export function calculateBillionaireEquivalent(medianAmount, medianNetWorth, billionaireNetWorth) {
    if (!medianAmount || !medianNetWorth || !billionaireNetWorth) {
        throw new Error('All parameters are required');
    }
    if (medianAmount < 0 || medianNetWorth <= 0 || billionaireNetWorth <= 0) {
        throw new Error('All values must be positive');
    }

    const ratio = medianAmount / medianNetWorth;
    return ratio * billionaireNetWorth;
}

/**
 * Calculate percentage of wealth
 * @param {number} amount - The amount being spent
 * @param {number} totalWealth - Total wealth
 * @returns {string} Percentage with 1 decimal place
 */
export function calculatePercentageOfWealth(amount, totalWealth) {
    if (!amount || !totalWealth) {
        throw new Error('Both parameters are required');
    }
    if (totalWealth <= 0) {
        throw new Error('Total wealth must be positive');
    }

    return ((amount / totalWealth) * 100).toFixed(1);
}
