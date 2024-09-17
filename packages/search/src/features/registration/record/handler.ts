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
import { ValidRecord } from '@opencrvs/commons/types'

import { indexRecord } from './service'

export async function recordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  if (typeof request.payload === 'object' && 'record' in request.payload) {
    const { record, transactionId } = request.payload as {
      record: ValidRecord
      transactionId: string
    }
    await indexRecord(record, transactionId)
    return h.response().code(200)
  }

  const record = request.payload as ValidRecord
  await indexRecord(record)
  return h.response().code(200)
}
