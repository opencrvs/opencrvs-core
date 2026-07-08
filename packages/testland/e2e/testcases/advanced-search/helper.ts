/**
 * Converts a numeric month value (1–12) to its corresponding English month name (e.g., "Jan", "Feb").
 *
 * @param {number} month - The month number (1 for January, 12 for December).
 * @param {Intl.DateTimeFormatOptions} formatOptions - The format options for the month.
 * @returns {string} The formatted month in English.
 *
 * @example
 * getMonthformatted(1); // returns "Jan"
 * getMonthformatted(12); // returns "Dec"
 * getMonthformatted(12, { month: 'long' }); // returns "December"
 */
export const getMonthFormatted = (
  month: number,
  formatOptions: Intl.DateTimeFormatOptions = { month: 'short' }
) => {
  const arbitraryDate = new Date(2000, month - 1)
  return arbitraryDate.toLocaleString('en-US', formatOptions)
}
