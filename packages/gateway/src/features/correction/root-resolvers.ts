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
import { GQLResolver } from '@gateway/graphql/schema'
import { IAuthHeader } from '@opencrvs/commons'

import { checkUserAssignment } from '@gateway/authorisation'
import { UnassignError } from '@gateway/utils/unassignError'
import { validateBirthDeclarationAttachments } from '@gateway/utils/validators'

import { UserInputError } from 'apollo-server-hapi'

export const resolvers: GQLResolver = {
  Mutation: {
    async requestEventCorrection(_, { id, details }, { headers: authHeader }) {
      if (inScope(authHeader, ['register', 'validate'])) {
        const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
        if (!hasAssignedToThisUser) {
          throw new UnassignError('User has been unassigned')
        }

        throw new Error('not implemented') /* @todo */
      } else {
        throw new Error('User does not have a register or validate scope')
      }
    },
    async rejectEventCorrection(_, { id, details }, { headers: authHeader }) {
      if (inScope(authHeader, ['register'])) {
        const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
        if (!hasAssignedToThisUser) {
          throw new UnassignError('User has been unassigned')
        }
        throw new Error('not implemented') /* @todo */
      } else {
        throw new Error('User does not have a register or validate scope')
      }
    },
    async approveEventCorrection(_, { id, details }, { headers: authHeader }) {
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
        return approveEventEventCorrection(id, authHeader, details)
      } else {
        throw new Error('User does not have a register scope')
      }
    },

    async createEventCorrection(_, { id, details }, { headers: authHeader }) {
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
        return createEventEventCorrection(id, authHeader, details)
      } else {
        throw new Error('User does not have a register scope')
      }
    }
  }
}

async function createEventEventCorrection(
  id: string,
  authHeader: IAuthHeader,
  input: unknown
) {
  throw new Error('not implemented') /* @todo */
}

async function approveEventEventCorrection(
  id: string,
  authHeader: IAuthHeader,
  input: unknown
) {
  throw new Error('not implemented') /* @todo */
}
