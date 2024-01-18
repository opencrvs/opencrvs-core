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
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { getToken } from '@workflow/utils/authUtils'
import { validateRequest } from '@workflow/utils/index'
import { toDuplicated } from '@workflow/records/state-transitions'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { auditEvent } from '@workflow/records/audit'
import { createRoute } from '@workflow/states'

const requestSchema = z.object({
  reason: z.string().optional(),
  comment: z.string().optional(),
  duplicateTrackingId: z.string().optional()
})

export const duplicateRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/duplicate',
  allowedStartStates: ['VALIDATED', 'READY_FOR_REVIEW'],
  action: 'DUPLICATE',
  includeHistoryResources: true,
  handler: async (request, record) => {
    const token = getToken(request)
    const payload = validateRequest(requestSchema, request.payload)

    const { reason, comment, duplicateTrackingId } = payload

    const { duplicatedRecord, duplicatedRecordWithTaskOnly } =
      await toDuplicated(
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
})
