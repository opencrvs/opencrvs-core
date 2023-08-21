/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { IAuthHeader } from '@gateway/common-types'
import {
  GQLResolver,
  GQLBirthRegistrationInput,
  GQLDeathRegistrationInput
} from '@gateway/graphql/schema'
import { inScope } from '@gateway/features/user/utils'
import {
  buildFHIRBundle,
  checkUserAssignment
} from '@gateway/features/registration/fhir-builders'
import { EVENT_TYPE } from '@gateway/features/fhir/constants'
import { fetchFHIR, getIDFromResponse } from '@gateway/features/fhir/utils'
import { validateBirthDeclarationAttachments } from '@gateway/utils/validators'
import { UserInputError } from 'apollo-server-hapi'
import { UnassignError } from '@gateway/utils/unassignError'
import {
  rejectRegistrationCorrection,
  requestRegistrationCorrection
} from '@gateway/workflow'

export const resolvers: GQLResolver = {
  Mutation: {
    async createBirthRegistrationCorrection(
      _,
      { id, details },
      { headers: authHeader }
    ) {
      if (inScope(authHeader, ['register'])) {
        const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
        if (!hasAssignedToThisUser) {
          throw new UnassignError('User has been unassigned')
        }
        try {
          await validateBirthDeclarationAttachments(details)
        } catch (error) {
          throw new UserInputError(error.message)
        }
        return await createEventRegistrationCorrection(
          id,
          authHeader,
          details,
          EVENT_TYPE.BIRTH
        )
      } else {
        throw new Error('User does not have a register scope')
      }
    },
    async requestRegistrationCorrection(
      _,
      { id, details },
      { headers: authHeader }
    ) {
      if (inScope(authHeader, ['register', 'validate'])) {
        const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
        if (!hasAssignedToThisUser) {
          throw new UnassignError('User has been unassigned')
        }

        await requestRegistrationCorrection(id, details, authHeader)
        return id
      } else {
        throw new Error('User does not have a register or validate scope')
      }
    },
    async rejectRegistrationCorrection(
      _,
      { id, details },
      { headers: authHeader }
    ) {
      if (inScope(authHeader, ['register'])) {
        const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
        if (!hasAssignedToThisUser) {
          throw new UnassignError('User has been unassigned')
        }
        await rejectRegistrationCorrection(id, details, authHeader)
        return id
      } else {
        throw new Error('User does not have a register or validate scope')
      }
    }
  }
}

async function createEventRegistrationCorrection(
  id: string,
  authHeader: IAuthHeader,
  reg: GQLBirthRegistrationInput | GQLDeathRegistrationInput,
  eventType: EVENT_TYPE
) {
  const fhirBundle = await buildFHIRBundle(reg, eventType, authHeader)

  const res = await fetchFHIR(
    '',
    authHeader,
    'POST',
    JSON.stringify(fhirBundle)
  )

  // return composition-id
  return getIDFromResponse(res)
}
