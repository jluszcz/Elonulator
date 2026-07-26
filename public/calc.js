/**
 * Calculation utility functions for the Elonulator application
 * Note: Formatting functions are in utils.js
 */

/**
 * Scale an amount by the ratio between two net worths.
 *
 * Both directions of the calculator are this one operation; they existed as two
 * functions with identical bodies and different parameter names, which is two
 * places to fix a validation bug.
 * @param {number} amount - Amount being spent by the `from` party
 * @param {number} fromNetWorth - Net worth of the party spending it
 * @param {number} toNetWorth - Net worth of the party to scale it to
 * @returns {number} The proportionally equivalent amount
 */
export function scaleByWealthRatio(amount, fromNetWorth, toNetWorth) {
    if (
        amount === null ||
        amount === undefined ||
        fromNetWorth === null ||
        fromNetWorth === undefined ||
        toNetWorth === null ||
        toNetWorth === undefined
    ) {
        throw new Error('All parameters are required');
    }
    if (amount < 0) {
        throw new Error('Amount must be non-negative');
    }
    if (fromNetWorth <= 0 || toNetWorth <= 0) {
        throw new Error('Net worths must be positive');
    }

    return (amount / fromNetWorth) * toNetWorth;
}

/**
 * Calculate equivalent amount for median American based on billionaire spending
 * @param {number} billionaireAmount - Amount billionaire is spending
 * @param {number} billionaireNetWorth - Billionaire's total net worth
 * @param {number} medianNetWorth - Median American net worth
 * @returns {number} Equivalent amount for median American
 */
export function calculateMedianEquivalent(billionaireAmount, billionaireNetWorth, medianNetWorth) {
    return scaleByWealthRatio(billionaireAmount, billionaireNetWorth, medianNetWorth);
}

/**
 * Calculate equivalent amount for billionaire based on median American spending
 * @param {number} medianAmount - Amount median American is spending
 * @param {number} medianNetWorth - Median American net worth
 * @param {number} billionaireNetWorth - Billionaire's total net worth
 * @returns {number} Equivalent amount for billionaire
 */
export function calculateBillionaireEquivalent(medianAmount, medianNetWorth, billionaireNetWorth) {
    return scaleByWealthRatio(medianAmount, medianNetWorth, billionaireNetWorth);
}

/**
 * Calculate percentage of wealth
 * @param {number} amount - The amount being spent
 * @param {number} totalWealth - Total wealth
 * @returns {string} Percentage with 1 decimal place
 */
export function calculatePercentageOfWealth(amount, totalWealth) {
    if (amount === null || amount === undefined || totalWealth === null || totalWealth === undefined) {
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
