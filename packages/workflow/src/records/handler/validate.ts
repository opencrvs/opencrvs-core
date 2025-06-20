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
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/auth-utils'
import { indexBundle } from '@workflow/records/search'
import { toValidated } from '@workflow/records/state-transitions'
import { auditEvent } from '@workflow/records/audit'
import { validateRequest } from '@workflow/utils/index'
import * as z from 'zod'
import { SCOPES } from '@opencrvs/commons/authentication'
import { getRecordSpecificToken } from '@workflow/records/token-exchange'
import { getComposition } from '@opencrvs/commons/types'
import { notifyForAction } from '@workflow/utils/country-config-api'
import { getEventType } from '@workflow/features/registration/utils'
import { getRecordById } from '@workflow/records'

export const validateRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/validate',
  allowedStartStates: ['IN_PROGRESS', 'READY_FOR_REVIEW'],
  action: 'VALIDATE',
  allowedScopes: [SCOPES.RECORD_SUBMIT_FOR_APPROVAL],
  includeHistoryResources: true,
  handler: async (request, record) => {
    const token = getToken(request)
    const payload = validateRequest(
      z.object({
        comments: z.string().optional(),
        timeLoggedMS: z.number().optional()
      }),
      request.payload
    )

    await toValidated(record, token, payload.comments, payload.timeLoggedMS)
    const validatedRecord = await getRecordById(
      request.params.recordId,
      request.headers.authorization,
      ['VALIDATED'],
      true
    )

    await indexBundle(validatedRecord, token)
    await auditEvent('sent-for-approval', validatedRecord, token)
    /*
     * Notify country configuration about the event so that countries can hook into actions like "sent-for-approval"
     */
    const recordSpecificToken = await getRecordSpecificToken(
      token,
      request.headers,
      getComposition(validatedRecord).id
    )
    await notifyForAction({
      event: getEventType(validatedRecord),
      action: 'sent-for-approval',
      record,
      headers: {
        ...request.headers,
        authorization: `Bearer ${recordSpecificToken.access_token}`
      }
    })

    return validatedRecord
  }
})
