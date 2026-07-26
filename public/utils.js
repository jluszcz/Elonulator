/**
 * Formatting utility functions for the Elonulator application
 * Note: Calculation functions are in calc.js
 */

/**
 * Format a number as currency with appropriate unit (billion, million, thousand)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    // Largest unit first. The unit is chosen from the *rounded* mantissa, so a
    // value like 999,999,999 formats as "$1.00 billion" rather than
    // "$1000.00 million" — picking the unit before rounding let the display
    // round across the boundary.
    const units = [
        [1000000000, 'billion'],
        [1000000, 'million'],
        [1000, 'thousand'],
    ];

    for (const [divisor, name] of units) {
        const mantissa = absAmount / divisor;
        if (mantissa >= 0.9995) {
            return `${sign}$${mantissa.toFixed(2)} ${name}`;
        }
    }

    return `${sign}$${absAmount.toFixed(2)}`;
}

/**
 * Format a number with commas as thousands separator and 2 decimal places
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
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
        maximumFractionDigits: 0,
    }).format(num);
}

/**
 * Insert commas as thousands separators into a numeric string, preserving
 * any decimal portion as typed (e.g. "1234.5" -> "1,234.5", "1000." -> "1,000.")
 * @param {string} value - Numeric string containing only digits and dots
 * @returns {string} The value with commas inserted into the integer part
 */
export function addThousandsSeparators(value) {
    const [integerPart, ...decimalParts] = value.split('.');
    const withCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalParts.length === 0 ? withCommas : `${withCommas}.${decimalParts.join('.')}`;
}

/**
 * Parse a formatted input value ("1,000,000") into a number.
 *
 * Returns NaN for malformed input rather than truncating it. `parseFloat` reads
 * "1.2.3" as 1.2, and `addThousandsSeparators` deliberately preserves a stray
 * second decimal point while typing — so without this check the app calculates
 * confidently on a number the user never entered.
 * @param {string} value - The raw input value
 * @returns {number} The parsed number, or NaN if the value is not a valid number
 */
export function parseFormattedNumber(value) {
    const cleaned = String(value ?? '').replace(/[^0-9.]/g, '');
    if (cleaned === '' || (cleaned.match(/\./g) || []).length > 1) {
        return NaN;
    }
    return parseFloat(cleaned);
}
