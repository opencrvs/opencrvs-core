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
 * The external id of the office an initial user's `primaryOfficeId` refers to.
 *
 * A country config states a user's office as a compound reference whose last
 * underscore-separated segment is the office's own id — the same id the
 * hierarchy seed-data declares the office under, and so the external id the
 * office is written with. Everything before the last underscore is context for
 * the human reading the spreadsheet.
 *
 * This lives in its own module because two places need it and they must not
 * disagree: pre-flight validation resolves the office against the location
 * seed-data, and the write path resolves it against the database. Were they to
 * derive different strings, validation would pass on one office and the write
 * would then fail looking up another.
 */
export function officeExternalId(primaryOfficeId: string): string {
  const segments = primaryOfficeId.split('_')
  return segments[segments.length - 1]
}
