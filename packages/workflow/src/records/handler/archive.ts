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
import * as z from 'zod'
import * as Hapi from '@hapi/hapi'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { getToken } from '@workflow/utils/authUtils'
import { validateRequest } from '@workflow/utils/index'
import { toArchived } from '@workflow/records/state-transitions'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { indexBundle, indexBundleForAssignment } from '@workflow/records/search'
import { getRecordById } from '@workflow/records/index'

const requestSchema = z.object({
  id: z.string(),
  reason: z.string().optional(),
  comment: z.string().optional(),
  duplicateTrackingId: z.string().optional()
})

export async function archiveRecordHandler(
  request: Hapi.Request,
  _: Hapi.ResponseToolkit
) {
  const token = getToken(request)
  const payload = validateRequest(requestSchema, request.payload)
  const record = await getRecordById(
    // Task history is fetched rather than the task only
    `${payload.id}?includeHistoryResources`,
    token,
    ['READY_FOR_REVIEW', 'REGISTERED']
  )

  const { reason, comment, duplicateTrackingId } = payload

  const { archivedRecord, archivedRecordWithTaskOnly } = await toArchived(
    record,
    await getLoggedInPractitionerResource(token),
    reason,
    comment,
    duplicateTrackingId
  )

  await sendBundleToHearth(archivedRecordWithTaskOnly)
  await indexBundle(archivedRecord, token)
  await indexBundleForAssignment(
    archivedRecordWithTaskOnly,
    token,
    '/events/unassigned'
  )

  return archivedRecord
}
