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
import * as z from 'zod'
import { getToken } from '@workflow/utils/authUtils'
import { validateRequest } from '@workflow/utils/index'
import { getRecordById } from '@workflow/records/index'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { toReinstated } from '@workflow/records/state-transitions'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { indexBundle } from '@workflow/records/search'

export async function reinstateRecordHandler(
  request: Hapi.Request,
  _: Hapi.ResponseToolkit
) {
  const token = getToken(request)
  const payload = validateRequest(z.object({ id: z.string() }), request.payload)
  const record = await getRecordById(
    // Task history is fetched rather than the task only
    `${payload.id}?includeHistoryResources`,
    token,
    ['ARCHIVED']
  )

  const taskHistoryEntries = record.entry.filter(
    (e) => e.resource.resourceType === 'TaskHistory'
  )

  const prevBusinessStatuses = taskHistoryEntries.map(
    //@ts-ignore
    (e) => e.resource.businessStatus.coding[0].code
  )

  const filteredStatuses = prevBusinessStatuses.filter(
    (status) => status !== 'ARCHIVED'
  )

  const prevRegStatus = filteredStatuses[filteredStatuses.length - 1]

  if (!prevRegStatus) {
    return await Promise.reject(new Error('Task has no reg-status code'))
  }

  const { reinstatedRecordWithTaskOnly, taskId } = await toReinstated(
    record,
    await getLoggedInPractitionerResource(token),
    prevRegStatus
  )

  await sendBundleToHearth(reinstatedRecordWithTaskOnly)
  await indexBundle(reinstatedRecordWithTaskOnly, token)

  return { taskId, prevRegStatus }
}
