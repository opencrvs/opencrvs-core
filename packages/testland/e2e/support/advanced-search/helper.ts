/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
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
