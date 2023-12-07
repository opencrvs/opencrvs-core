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
  getStatusFromTask,
  getTaskFromSavedBundle,
  ValidRecord
} from '@opencrvs/commons/types'
import * as Hapi from '@hapi/hapi'
import * as z from 'zod'
import { validateRequest } from '@workflow/utils/index'
import { getRecordById } from '../index'
import { getToken } from '@workflow/utils/authUtils'

export async function downloadRecordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = validateRequest(
    z.object({
      id: z.string()
    }),
    request.payload
  )

  const token = getToken(request)
  const record = await getRecordById(payload.id, token, [
    'CERTIFIED',
    'VALIDATED',
    'IN_PROGRESS',
    'READY_FOR_REVIEW',
    'REGISTERED',
    'ISSUED',
    'CORRECTION_REQUESTED'
  ])

  const task = getTaskFromSavedBundle(record)
  const businessStatus = getStatusFromTask(task)

  if (!businessStatus) {
    throw new Error("Task didn't have any status. This should never happen")
  }

  return record as ValidRecord
}
