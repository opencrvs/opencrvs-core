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
import { toDuplicated } from '@workflow/records/state-transitions'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { getRecordById } from '@workflow/records/index'
import { auditEvent } from '@workflow/records/audit'

const requestSchema = z.object({
  id: z.string(),
  reason: z.string().optional(),
  comment: z.string().optional(),
  duplicateTrackingId: z.string().optional()
})

export async function duplicateRecordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = getToken(request)
  const payload = validateRequest(requestSchema, request.payload)
  const record = await getRecordById(
    // Task history is fetched rather than the task only
    `${payload.id}?includeHistoryResources`,
    token,
    ['READY_FOR_REVIEW']
  )

  const { reason, comment, duplicateTrackingId } = payload

  const { duplicatedRecord, duplicatedRecordWithTaskOnly } = await toDuplicated(
    record,
    await getLoggedInPractitionerResource(token),
    reason,
    comment,
    duplicateTrackingId
  )

  await sendBundleToHearth(duplicatedRecordWithTaskOnly)
  await auditEvent('marked-as-duplicate', duplicatedRecord, token)

  return duplicatedRecord
}
