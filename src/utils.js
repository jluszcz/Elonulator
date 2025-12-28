/**
 * Calculation utility functions for the Elonulator application
 * Note: Formatting functions are in public/utils.js
 */

/**
 * Calculate equivalent amount for median American based on billionaire spending
 * @param {number} billionaireAmount - Amount billionaire is spending
 * @param {number} billionaireNetWorth - Billionaire's total net worth
 * @param {number} medianNetWorth - Median American net worth
 * @returns {number} Equivalent amount for median American
 */
export function calculateMedianEquivalent(billionaireAmount, billionaireNetWorth, medianNetWorth) {
    if (billionaireAmount === null || billionaireAmount === undefined ||
        billionaireNetWorth === null || billionaireNetWorth === undefined ||
        medianNetWorth === null || medianNetWorth === undefined) {
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
    if (medianAmount === null || medianAmount === undefined ||
        medianNetWorth === null || medianNetWorth === undefined ||
        billionaireNetWorth === null || billionaireNetWorth === undefined) {
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
    if (amount === null || amount === undefined ||
        totalWealth === null || totalWealth === undefined) {
        throw new Error('Both parameters are required');
    }
    if (totalWealth <= 0) {
        throw new Error('Total wealth must be positive');
    }
    if (amount < 0) {
        throw new Error('Amount must be non-negative');
    }

    return ((amount / totalWealth) * 100).toFixed(1);
}
