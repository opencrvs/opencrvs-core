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
import {
  updateEventToAddAssignment,
  updateEventToRemoveAssignment
} from '@search/features/registration/assignment/service'
import { logger } from '@search/logger'
import { internal } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import { getTokenPayload } from '@search/utils/authUtils'
import { RouteScope } from '@search/config/routes'

export async function assignEventHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const tokenPayload = getTokenPayload(request.headers.authorization)
    if (tokenPayload.scope.includes(RouteScope.RECORD_SEARCH)) {
      return h.response().code(200)
    }

    await updateEventToAddAssignment(request)
  } catch (error) {
    logger.error(`Search/assignEventHandler: error: ${error}`)
    return internal(error)
  }

  return h.response().code(200)
}

export async function unassignEventHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    await updateEventToRemoveAssignment(request)
  } catch (error) {
    logger.error(`Search/unassignEventHandler: error: ${error}`)
    return internal(error)
  }

  return h.response().code(200)
}
