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
import { getToken } from '@workflow/utils/auth-utils'
import { validateRequest } from '@workflow/utils/index'
import * as z from 'zod'
import { getRecordById } from '@workflow/records/index'
import { toUnassigned } from '@workflow/records/state-transitions'
import { indexBundleToRoute } from '@workflow/records/search'
import { sendBundleToHearth } from '@workflow/records/fhir'

export async function unassignRecordHandler(
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
  const record = await getRecordById(
    // Task history is fetched rather than the task only
    `${payload.id}?includeHistoryResources`,
    token,
    [
      'CERTIFIED',
      'VALIDATED',
      'IN_PROGRESS',
      'READY_FOR_REVIEW',
      'REGISTERED',
      'ISSUED',
      'CORRECTION_REQUESTED'
    ]
  )

  const unassignedRecord = await toUnassigned(record, token)

  await sendBundleToHearth(unassignedRecord)
  await indexBundleToRoute(unassignedRecord, token, '/events/unassigned')

  return unassignedRecord
}
