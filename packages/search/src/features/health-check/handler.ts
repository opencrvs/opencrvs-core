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
import { logger } from '@search/logger'
import * as Hapi from '@hapi/hapi'
import { GIT_HASH } from '@search/constants'
import fetch from 'node-fetch'

async function dependencyHealth() {
  try {
    const response = await fetch('http://localhost:9200/_cluster/health', {
      method: 'GET'
    })
    if (response.status === 200) return { status: 'ok' }
    else return { status: 'error' }
    // return response.json()
  } catch (error) {
    return { status: 'error' }
  }
}

export async function healthCheckHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const dependencyStatus = await dependencyHealth()
    return h
      .response({
        git_hash: GIT_HASH,
        status: 'ok',
        dependencies: { elasticsearch: dependencyStatus }
      })
      .code(200)
  } catch (err) {
    logger.error(err)
    return h.response({ status: 'error' }).code(500)
  }
}
