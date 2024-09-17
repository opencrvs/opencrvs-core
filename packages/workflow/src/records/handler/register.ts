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
import { auditEvent } from '@workflow/records/audit'
import { indexBundle } from '@workflow/records/search'
import { toWaitingForExternalValidationState } from '@workflow/records/state-transitions'
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/auth-utils'
import { validateRequest } from '@workflow/utils/index'
import * as z from 'zod'

export const registerRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/register',
  allowedStartStates: ['READY_FOR_REVIEW', 'VALIDATED'],
  action: 'WAITING_VALIDATION',
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

    const recordInWaitingValidationState =
      await toWaitingForExternalValidationState(
        record,
        token,
        payload.comments,
        payload.timeLoggedMS
      )

    await indexBundle(recordInWaitingValidationState, token)
    await auditEvent(
      'waiting-external-validation',
      recordInWaitingValidationState,
      token
    )

    return recordInWaitingValidationState
  }
})
