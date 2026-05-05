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
import * as Hapi from '@hapi/hapi'
import { EVENTS_URL } from '@gateway/constants'
import fetch from '@gateway/fetch'

export default async function healthCheckHandler(
  _request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const res = await fetch(`${EVENTS_URL}health/ready`, { method: 'GET' })
    if (!res.ok) {
      return h.response({ success: false }).code(503)
    }
    return { success: true }
  } catch {
    return h.response({ success: false }).code(503)
  }
}
