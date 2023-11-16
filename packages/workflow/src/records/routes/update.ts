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
  BirthRegistration as GQLBirthRegistration,
  DeathRegistration as GQLDeathRegistration,
  MarriageRegistration as GQLMarriageRegistration,
  EVENT_TYPE,
  updateFHIRBundle,
  Registration
} from '@opencrvs/commons/types'
import { logger } from '@workflow/logger'
import { z } from 'zod'
import { indexBundle } from '@workflow/records/search'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { toUpdated } from '@workflow/records/state-transitions'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { validateRequest } from '@workflow/features/correction/routes'
import { ChangedValuesInput } from '@workflow/records/correction-request'

type BirthRegistration = Omit<GQLBirthRegistration, 'registration'> & {
  registration: Registration
}
type DeathRegistration = Omit<GQLDeathRegistration, 'registration'> & {
  registration: Registration
}
type MarriageRegistration = Omit<GQLMarriageRegistration, 'registration'> & {
  registration: Registration
}

const requestSchema = z.object({
  event: z.custom<EVENT_TYPE>(),
  details: z.custom<
    BirthRegistration | DeathRegistration | MarriageRegistration
  >(),
  id: z.custom<string>()
})

export const updateRoute = [
  createRoute({
    method: 'POST',
    path: '/records/{recordId}/update',
    allowedStartStates: ['IN_PROGRESS', 'DECLARED'],
    action: 'DECLARATION_UPDATED',
    handler: async (request, record) => {
      try {
        const token = getToken(request)
        const payload = validateRequest(requestSchema, request.payload)

        const { details, event } = payload
        const { registration, ...detailsWithoutReg } = details
        const { changedValues, ...restOfRegistration } = registration
        const updatedDetails = validateRequest(
          ChangedValuesInput,
          changedValues
        )

        const recordInUpdatedState = await toUpdated(
          record,
          await getLoggedInPractitionerResource(token),
          updatedDetails
        )

        const updatedBundle = updateFHIRBundle(
          recordInUpdatedState,
          { ...detailsWithoutReg, registration: restOfRegistration },
          event
        )

        await sendBundleToHearth(updatedBundle)
        await indexBundle(updatedBundle, token)
        return updatedBundle
      } catch (error) {
        logger.error(`Workflow/updatedHandler: error: ${error}`)
        throw new Error(error)
      }
    }
  })
]
