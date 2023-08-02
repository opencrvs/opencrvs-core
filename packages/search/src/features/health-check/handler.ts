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
import { logger } from '@search/logger'
import * as Hapi from '@hapi/hapi'
import { GIT_HASH } from '@search/constants'

export async function healthCheckHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    return h.response({ git_hash: GIT_HASH, status: 'ok' }).code(200)
  } catch (err) {
    logger.error(err)
    return h.response({ status: 'error' }).code(500)
  }
}
