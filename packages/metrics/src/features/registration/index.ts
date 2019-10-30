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
export interface IBirthRegistrationPoint extends IPoint {
  current_status: string
  age_in_days: number | undefined
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export interface IPoint {
  time?: string
}

export interface IPointLocation {
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export interface IAuthHeader {
  Authorization: string
}

export interface IBirthRegistrationTags {
  reg_status: string
  gender: string | undefined
}
