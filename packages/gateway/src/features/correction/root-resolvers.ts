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
import { IAuthHeader } from '@opencrvs/commons'
import {
  GQLResolver,
  GQLBirthRegistrationInput,
  GQLDeathRegistrationInput,
  GQLMarriageRegistrationInput
} from '@gateway/graphql/schema'
import { inScope } from '@gateway/features/user/utils'
import {
  updateFHIRBundle,
  checkUserAssignment
} from '@gateway/features/registration/fhir-builders'
import { EVENT_TYPE } from '@gateway/features/fhir/constants'
import { fetchFHIR, getIDFromResponse } from '@gateway/features/fhir/utils'
import {
  validateBirthDeclarationAttachments,
  validateDeathDeclarationAttachments,
  validateMarriageDeclarationAttachments
} from '@gateway/utils/validators'
import { UserInputError } from 'apollo-server-hapi'
import { UnassignError } from '@gateway/utils/unassignError'
import {
  approveRegistrationCorrection,
  makeRegistrationCorrection,
  rejectRegistrationCorrection,
  requestRegistrationCorrection
} from '@gateway/workflow'

export const resolvers: GQLResolver = {
  Mutation: {
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
    },
    async approveBirthRegistrationCorrection(
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
        return approveEventRegistrationCorrection(
          id,
          authHeader,
          details,
          EVENT_TYPE.BIRTH
        )
      } else {
        throw new Error('User does not have a register scope')
      }
    },
    async approveDeathRegistrationCorrection(
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
          await validateDeathDeclarationAttachments(details)
        } catch (error) {
          throw new UserInputError(error.message)
        }
        return await approveEventRegistrationCorrection(
          id,
          authHeader,
          details,
          EVENT_TYPE.DEATH
        )
      } else {
        throw new Error('User does not have a register scope')
      }
    },
    async approveMarriageRegistrationCorrection(
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
          await validateMarriageDeclarationAttachments(details)
        } catch (error) {
          throw new UserInputError(error.message)
        }
        return await approveEventRegistrationCorrection(
          id,
          authHeader,
          details,
          EVENT_TYPE.MARRIAGE
        )
      } else {
        throw new Error('User does not have a register scope')
      }
    },
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
        return createEventRegistrationCorrection(
          id,
          authHeader,
          details,
          EVENT_TYPE.BIRTH
        )
      } else {
        throw new Error('User does not have a register scope')
      }
    },
    async createDeathRegistrationCorrection(
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
          await validateDeathDeclarationAttachments(details)
        } catch (error) {
          throw new UserInputError(error.message)
        }
        return await createEventRegistrationCorrection(
          id,
          authHeader,
          details,
          EVENT_TYPE.DEATH
        )
      } else {
        throw new Error('User does not have a register scope')
      }
    },
    async createMarriageRegistrationCorrection(
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
          await validateMarriageDeclarationAttachments(details)
        } catch (error) {
          throw new UserInputError(error.message)
        }
        return await createEventRegistrationCorrection(
          id,
          authHeader,
          details,
          EVENT_TYPE.MARRIAGE
        )
      } else {
        throw new Error('User does not have a register scope')
      }
    }
  }
}

async function createEventRegistrationCorrection(
  id: string,
  authHeader: IAuthHeader,
  input:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput,
  eventType: EVENT_TYPE
) {
  const correctionDetails = input.registration?.correction

  if (!correctionDetails) {
    throw new Error('Correction details are required')
  }

  const { correction, ...otherRegistrationDetails } = input.registration!

  const inputWithoutCorrection = {
    ...input,
    registration: otherRegistrationDetails
  }

  const record = await makeRegistrationCorrection(
    id,
    correctionDetails,
    authHeader
  )

  const fhirBundle = await updateFHIRBundle(
    record,
    inputWithoutCorrection,
    eventType,
    authHeader
  )

  const res = await fetchFHIR(
    '',
    authHeader,
    'POST',
    JSON.stringify(fhirBundle)
  )

  // return composition-id
  return getIDFromResponse(res)
}

async function approveEventRegistrationCorrection(
  id: string,
  authHeader: IAuthHeader,
  input:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput,
  eventType: EVENT_TYPE
) {
  const correctionDetails = input.registration?.correction

  if (!correctionDetails) {
    throw new Error('Correction details are required')
  }

  const { correction, ...otherRegistrationDetails } = input.registration!

  const inputWithoutCorrection = {
    ...input,
    registration: otherRegistrationDetails
  }

  const record = await approveRegistrationCorrection(
    id,
    correctionDetails,
    authHeader
  )

  const fhirBundle = await updateFHIRBundle(
    record,
    inputWithoutCorrection,
    eventType,
    authHeader
  )

  const res = await fetchFHIR(
    '',
    authHeader,
    'POST',
    JSON.stringify(fhirBundle)
  )

  // return composition-id
  return getIDFromResponse(res)
}
