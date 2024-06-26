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
export function isInvalidDate(date?: string) {
  if (!date) return false
  const regEx = /^\d{4}-\d{2}-\d{2}$/
  if (!date.match(regEx)) {
    return true
  }
  const d = new Date(date)
  const dNum = d.getTime()
  if (!dNum && dNum !== 0) {
    return true
  }
  return d.toISOString().slice(0, 10) !== date
}
