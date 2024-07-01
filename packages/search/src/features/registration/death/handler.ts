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

import { logger } from '@opencrvs/commons'

import { internal } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import { ValidRecord } from '@opencrvs/commons/types'
import { indexRecord } from '@search/features/registration/death/service'

export async function deathEventHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const record = request.payload as ValidRecord
  try {
    await indexRecord(record)
  } catch (error) {
    logger.error(`Search/deathEventHandler: error: ${error}`)
    return internal(error)
  }

  return h.response().code(200)
}
