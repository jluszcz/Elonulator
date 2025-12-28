/**
 * Shared utility functions for the Elonulator application
 * Used by both client-side and server-side code
 */

/**
 * Format a number as currency with appropriate unit (billion, million, thousand)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (absAmount >= 1000000000) {
        return `$${sign}${(absAmount / 1000000000).toFixed(2)} billion`;
    } else if (absAmount >= 1000000) {
        return `$${sign}${(absAmount / 1000000).toFixed(2)} million`;
    } else if (absAmount >= 1000) {
        return `$${sign}${(absAmount / 1000).toFixed(2)} thousand`;
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
