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
import { boomify } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import { RecordNotFoundError, getRecordById } from './service'

export async function getRecordByIdHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const recordId = request.params.recordId
  const allowedStates = request.query.states?.split(',') || []
  const includeHistoryResources =
    request.query.includeHistoryResources !== undefined
  try {
    const bundle = await getRecordById(
      recordId,
      allowedStates,
      includeHistoryResources
    )

    return bundle
  } catch (error) {
    if (error instanceof RecordNotFoundError) {
      return h.response({ error: error.message }).code(404)
    }
    throw boomify(error)
  }
}
