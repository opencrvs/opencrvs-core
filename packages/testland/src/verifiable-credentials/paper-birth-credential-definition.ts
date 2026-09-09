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
 * JWT VC payload data for a paper birth credential.
 *
 * This interface mirrors the `credentialData` structure produced by
 * `paperBirthCredentialTemplate` for issuance.
 */
export interface PaperBirthCredentialData {
  /** Birth registration number. */
  rn: string
  /** Child given name. */
  gn: string
  /** Child family name. */
  fn: string
  /** Birth date in ISO 8601 (YYYY-MM-DD) format. */
  dob: string
}
