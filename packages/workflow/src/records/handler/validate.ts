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
import { getToken } from '@workflow/utils/authUtils'
import { indexBundle } from '@workflow/records/search'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { toValidated } from '@workflow/records/state-transitions'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { validateRequest } from '@workflow/utils/index'
import * as z from 'zod'

export const validateRoute = [
  createRoute({
    method: 'POST',
    path: '/records/{recordId}/validate',
    allowedStartStates: ['IN_PROGRESS', 'READY_FOR_REVIEW'],
    action: 'VALIDATE',
    handler: async (request, record) => {
      const token = getToken(request)
      const payload = validateRequest(
        z.object({
          comments: z.string().optional(),
          timeLoggedMS: z.number().optional()
        }),
        request.payload
      )

      const practitioner = await getLoggedInPractitionerResource(token)

      const recordInValidatedRequestedState = await toValidated(
        record,
        practitioner,
        payload.comments,
        payload.timeLoggedMS
      )

      await sendBundleToHearth(recordInValidatedRequestedState)

      await indexBundle(recordInValidatedRequestedState, token)

      return recordInValidatedRequestedState
    }
  })
]
