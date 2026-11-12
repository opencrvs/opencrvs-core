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
import { logger } from '@opencrvs/commons'
import { api } from '@gateway/v2-events/events/service'

/** Calls events as the user who called gateway. */
function asUser(request: Hapi.Request) {
  return {
    context: { headers: { authorization: request.headers.authorization } }
  }
}

export async function configHandler(request: Hapi.Request) {
  try {
    const [certificates, config] = await Promise.all([
      api.config.certificates.query(undefined, asUser(request)),
      api.config.application.query(undefined, asUser(request))
    ])
    return { config, certificates }
  } catch (ex) {
    logger.error(ex)
    if (process.env.NODE_ENV === 'development') {
      throw ex
    }
    return {}
  }
}

export async function publicConfigHandler() {
  return { config: await api.config.publicApplication.query() }
}
