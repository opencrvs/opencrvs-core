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
import { toArchived } from '@workflow/records/state-transitions'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { indexBundle } from '@workflow/records/search'
import { createRoute } from '@workflow/states'

const requestSchema = z.object({
  id: z.string(),
  reason: z.string().optional(),
  comment: z.string().optional(),
  duplicateTrackingId: z.string().optional()
})

export const archiveRoute = [
  createRoute({
    method: 'POST',
    path: '/records/{recordId}/archive',
    allowedStartStates: ['REGISTERED', 'READY_FOR_REVIEW', 'VALIDATED'],
    action: 'ARCHIVE',
    handler: async (request, record) => {
      const token = getToken(request)
      const payload = validateRequest(requestSchema, request.payload)

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

      return archivedRecord
    }
  })
]
