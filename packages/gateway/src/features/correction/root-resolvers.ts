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
import { inScope } from '@gateway/features/user/utils'
import {
  GQLBirthRegistrationInput,
  GQLDeathRegistrationInput,
  GQLMarriageRegistrationInput,
  GQLResolver
} from '@gateway/graphql/schema'
import { IAuthHeader } from '@opencrvs/commons'

import { checkUserAssignment } from '@gateway/authorisation'

import {
  validateBirthDeclarationAttachments,
  validateDeathDeclarationAttachments,
  validateMarriageDeclarationAttachments
} from '@gateway/utils/validators'
import {
  approveRegistrationCorrection,
  makeRegistrationCorrection,
  rejectRegistrationCorrection,
  requestRegistrationCorrection
} from '@gateway/workflow'
import { SCOPES } from '@opencrvs/commons/authentication'
import { UnassignError, UserInputError } from '@gateway/utils/graphql-errors'

export const resolvers: GQLResolver = {
  Mutation: {
    async requestRegistrationCorrection(
      _,
      { id, details },
      { headers: authHeader }
    ) {
      if (
        inScope(authHeader, [SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION])
      ) {
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
      if (inScope(authHeader, [SCOPES.RECORD_REGISTRATION_CORRECT])) {
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
      if (inScope(authHeader, [SCOPES.RECORD_REGISTRATION_CORRECT])) {
        const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
        if (!hasAssignedToThisUser) {
          throw new UnassignError('User has been unassigned')
        }
        try {
          await validateBirthDeclarationAttachments(details)
        } catch (error) {
          throw new UserInputError(error.message)
        }
        return approveEventRegistrationCorrection(id, authHeader, details)
      } else {
        throw new Error('User does not have a register scope')
      }
    },
    async approveDeathRegistrationCorrection(
      _,
      { id, details },
      { headers: authHeader }
    ) {
      if (inScope(authHeader, [SCOPES.RECORD_REGISTRATION_CORRECT])) {
        const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
        if (!hasAssignedToThisUser) {
          throw new UnassignError('User has been unassigned')
        }
        try {
          await validateDeathDeclarationAttachments(details)
        } catch (error) {
          throw new UserInputError(error.message)
        }
        return await approveEventRegistrationCorrection(id, authHeader, details)
      } else {
        throw new Error('User does not have a register scope')
      }
    },
    async approveMarriageRegistrationCorrection(
      _,
      { id, details },
      { headers: authHeader }
    ) {
      if (inScope(authHeader, [SCOPES.RECORD_REGISTRATION_CORRECT])) {
        const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
        if (!hasAssignedToThisUser) {
          throw new UnassignError('User has been unassigned')
        }
        try {
          await validateMarriageDeclarationAttachments(details)
        } catch (error) {
          throw new UserInputError(error.message)
        }
        return await approveEventRegistrationCorrection(id, authHeader, details)
      } else {
        throw new Error('User does not have a register scope')
      }
    },
    async createBirthRegistrationCorrection(
      _,
      { id, details },
      { headers: authHeader }
    ) {
      if (inScope(authHeader, [SCOPES.RECORD_REGISTRATION_CORRECT])) {
        const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
        if (!hasAssignedToThisUser) {
          throw new UnassignError('User has been unassigned')
        }
        try {
          await validateBirthDeclarationAttachments(details)
        } catch (error) {
          throw new UserInputError(error.message)
        }
        return createEventRegistrationCorrection(id, authHeader, details)
      } else {
        throw new Error('User does not have a register scope')
      }
    },
    async createDeathRegistrationCorrection(
      _,
      { id, details },
      { headers: authHeader }
    ) {
      if (inScope(authHeader, [SCOPES.RECORD_REGISTRATION_CORRECT])) {
        const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
        if (!hasAssignedToThisUser) {
          throw new UnassignError('User has been unassigned')
        }
        try {
          await validateDeathDeclarationAttachments(details)
        } catch (error) {
          throw new UserInputError(error.message)
        }
        return await createEventRegistrationCorrection(id, authHeader, details)
      } else {
        throw new Error('User does not have a register scope')
      }
    },
    async createMarriageRegistrationCorrection(
      _,
      { id, details },
      { headers: authHeader }
    ) {
      if (inScope(authHeader, [SCOPES.RECORD_REGISTRATION_CORRECT])) {
        const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
        if (!hasAssignedToThisUser) {
          throw new UnassignError('User has been unassigned')
        }
        try {
          await validateMarriageDeclarationAttachments(details)
        } catch (error) {
          throw new UserInputError(error.message)
        }
        return await createEventRegistrationCorrection(id, authHeader, details)
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
    | GQLMarriageRegistrationInput
) {
  await makeRegistrationCorrection(id, input, authHeader)

  return id
}

async function approveEventRegistrationCorrection(
  id: string,
  authHeader: IAuthHeader,
  input:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput
) {
  await approveRegistrationCorrection(id, input, authHeader)
  return id
}
