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

/** The external id an initial user's `primaryOfficeId` refers to: its last
 * underscore-separated segment. Shared so that pre-flight validation and the
 * write path cannot resolve an office differently. */
export function getOfficeExternalId(primaryOfficeId: string): string {
  const segments = primaryOfficeId.split('_')
  return segments[segments.length - 1]
}
