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
// eslint-disable-next-line no-restricted-imports
import { isValid, parse } from 'date-fns'

export enum TIME_PERIOD {
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_90_DAYS = 'LAST_90_DAYS',
  LAST_YEAR = 'LAST_YEAR'
}

const validateDate = (dateString: string) => {
  const formats = ['yyyy-M-d', 'yyyy-MM-dd']
  return formats.some((format) =>
    isValid(parse(dateString, format, new Date()))
  )
}

export function isInvalidDate(date?: string) {
  if (!date) return true
  const regEx = /^\d{4}-\d{1,2}-\d{1,2}$/
  if (!date.match(regEx)) {
    return true
  }
  return !validateDate(date)
}
