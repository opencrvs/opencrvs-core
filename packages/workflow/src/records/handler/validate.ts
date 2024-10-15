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
import { getComposition } from '@opencrvs/commons/types'
import { writeMetricsEvent } from '@workflow/records/audit'
import { indexBundle } from '@workflow/records/search'
import { toValidated } from '@workflow/records/state-transitions'
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/auth-utils'
import { validateRequest } from '@workflow/utils/index'
import * as z from 'zod'

export const validateRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/validate',
  allowedStartStates: ['IN_PROGRESS', 'READY_FOR_REVIEW'],
  action: 'VALIDATE',
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

    const validatedRecord = await toValidated(
      record,
      token,
      payload.comments,
      payload.timeLoggedMS
    )

    await indexBundle(validatedRecord, token)
    await writeMetricsEvent('sent-for-approval', {
      record: validatedRecord,
      authToken: token,
      transactionId: `validate__${getComposition(validatedRecord).id}`
    })

    return validatedRecord
  }
})
