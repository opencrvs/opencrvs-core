/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

type OSIAUserInfo = {
  /** Unique Identity Number */
  uin: string
  /** First name */
  firstName: string
  /** Last name */
  lastName: string
  /** Spouse name */
  spouseName: string
  /** Date of birth. Date (iso8601). Example: 1987-11-17 */
  dateOfBirth: string
  /** Place of birth */
  placeOfBirth: string
  /** Gender. One of 0 (Not known), 1 (Male), 2 (Female), 9 (Not applicable) */
  gender: 0 | 1 | 2 | 9
  /** Date of death. Date (iso8601). Example: 2018-11-17 */
  dateOfDeath: string
  /** Place of death */
  placeOfDeath: string
  /** Reason of death */
  reasonOfDeath: string
  /** Status. Example: missing, wanted, dead, etc. */
  status: string
}
