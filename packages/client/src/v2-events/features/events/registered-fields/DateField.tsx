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
import { DateFieldValue } from '@opencrvs/commons/client'

export const INITIAL_DATE_VALUE = null

export const dateToString = (date: DateFieldValue) => {
  if (!date) {
    return ''
  }
  if (typeof date === 'string') {
    return date
  }
  return (date as Date).toISOString().split('T')[0]
}
