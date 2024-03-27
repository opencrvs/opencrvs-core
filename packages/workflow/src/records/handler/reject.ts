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
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/auth-utils'
import { validateRequest } from '@workflow/utils/index'
import { toRejected } from '@workflow/records/state-transitions'
import { indexBundle } from '@workflow/records/search'
import { auditEvent } from '@workflow/records/audit'

const requestSchema = z.object({
  comment: z.string(),
  reason: z.string()
})

export const rejectRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/reject',
  allowedStartStates: ['READY_FOR_REVIEW', 'IN_PROGRESS', 'VALIDATED'],
  action: 'REJECT',
  handler: async (request, record) => {
    const token = getToken(request)
    const payload = validateRequest(requestSchema, request.payload)

    const commentCode: fhir3.CodeableConcept = {
      text: payload.comment
    }

    const rejectedRecord = await toRejected(
      record,
      token,
      commentCode,
      payload.reason
    )

    await indexBundle(rejectedRecord, token)
    await auditEvent('sent-for-updates', rejectedRecord, token)

    return rejectedRecord
  }
})
