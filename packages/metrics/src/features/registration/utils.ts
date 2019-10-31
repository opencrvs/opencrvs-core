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
import * as moment from 'moment'

type YYYY_MM_DD = string
type ISO_DATE = string

export function getAgeInDays(dateOfBirth: YYYY_MM_DD) {
  return getDurationInDays(dateOfBirth, new Date().toISOString())
}

export function getDurationInDays(from: ISO_DATE, to: ISO_DATE) {
  const toDate = moment(to)
  const fromDate = moment(from)
  return toDate.diff(fromDate, 'days')
}

export function getDurationInSeconds(from: ISO_DATE, to: ISO_DATE) {
  const toDate = moment(to)
  const fromDate = moment(from)
  return toDate.diff(fromDate, 'seconds')
}
