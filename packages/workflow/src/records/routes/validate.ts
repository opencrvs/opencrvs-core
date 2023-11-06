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
import {
  BirthRegistration,
  buildFHIRBundle,
  DeathRegistration,
  EVENT_TYPE,
  MarriageRegistration,
  validateBundle
} from '@opencrvs/commons/types'
import { logger } from '@workflow/logger'
import { z } from 'zod'
import { indexBundle } from '@workflow/records/search'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { toValidated } from '@workflow/records/state-transitions'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { validateRequest } from '@workflow/features/correction/routes'

const requestSchema = z.object({
  event: z.custom<EVENT_TYPE>(),
  details: z.custom<
    BirthRegistration | DeathRegistration | MarriageRegistration
  >(),
  id: z.custom<string>()
})

export const validateRoute = [
  createRoute({
    method: 'POST',
    path: '/records/{recordId}/validate',
    allowedStartStates: ['IN_PROGRESS', 'DECLARED'],
    action: 'VALIDATION',
    handler: async (request, record) => {
      try {
        const token = getToken(request)

        const payload = validateRequest(requestSchema, request.payload)

        const { details: validationDetails, event } = payload

        const inputBundle = buildFHIRBundle(validationDetails, event)
        validateBundle(inputBundle)

        const practitioner = await getLoggedInPractitionerResource(token)

        const recordInValidatedRequestedState = await toValidated(
          record,
          practitioner
        )

        await sendBundleToHearth(recordInValidatedRequestedState)

        await indexBundle(recordInValidatedRequestedState, token)
        return recordInValidatedRequestedState
      } catch (error) {
        logger.error(`Workflow/markAsValidatedHandler: error: ${error}`)
        throw new Error(error)
      }
    }
  })
]
