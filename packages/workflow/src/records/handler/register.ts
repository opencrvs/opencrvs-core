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
import { useExternalValidationQueue } from '@opencrvs/commons/message-queue'
import { getComposition } from '@opencrvs/commons/types'
import { REDIS_HOST } from '@workflow/constants'
import { writeMetricsEvent } from '@workflow/records/audit'
import { indexBundle } from '@workflow/records/search'
import { toWaitingForExternalValidationState } from '@workflow/records/state-transitions'
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/auth-utils'
import { validateRequest } from '@workflow/utils/index'
import * as z from 'zod'

const { sendForExternalValidation } = useExternalValidationQueue({
  host: REDIS_HOST,
  port: 6379
})

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
    await writeMetricsEvent('waiting-external-validation', {
      record: recordInWaitingValidationState,
      authToken: token,
      transactionId: `send-to-external-validation__${
        getComposition(recordInWaitingValidationState).id
      }`
    })

    await sendForExternalValidation({
      record: recordInWaitingValidationState,
      token
    })

    return recordInWaitingValidationState
  }
})
