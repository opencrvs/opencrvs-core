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

export function formatTimeDuration(timeInSeconds: number) {
  const seconds = timeInSeconds % 60
  timeInSeconds = Math.floor(timeInSeconds / 60)
  const minutes = timeInSeconds % 60
  timeInSeconds = Math.floor(timeInSeconds / 60)
  const hours = timeInSeconds % 24
  const days = Math.floor(timeInSeconds / 24)

  return {
    days: ('0' + days).slice(-2),
    hours: ('0' + hours).slice(-2),
    minutes: ('0' + minutes).slice(-2),
    seconds: ('0' + seconds).slice(-2)
  }
}
