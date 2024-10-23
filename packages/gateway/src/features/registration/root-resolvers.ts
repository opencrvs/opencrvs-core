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
import { checkUserAssignment } from '@gateway/authorisation'
import { hasScope, inScope } from '@gateway/features/user/utils'
import { GQLResolver } from '@gateway/graphql/schema'
import { UnassignError } from '@gateway/utils/unassignError'
import { validateBirthDeclarationAttachments } from '@gateway/utils/validators'

import { UserInputError } from 'apollo-server-hapi'

export const resolvers: GQLResolver = {
  Query: {
    async fetchEvent(_, { id }, context): Promise<unknown> {
      if (
        hasScope(context.headers, 'register') ||
        hasScope(context.headers, 'validate') ||
        hasScope(context.headers, 'declare')
      ) {
        throw new Error('Not implemented') /* @todo */
      } else {
        throw new Error('User does not have a register or validate scope')
      }
    },

    async fetchRegistrationCountByStatus(
      _,
      { locationId, status, event },
      { headers: authHeader }
    ) {
      if (
        !(
          hasScope(authHeader, 'register') ||
          hasScope(authHeader, 'validate') ||
          hasScope(authHeader, 'declare') ||
          hasScope(authHeader, 'sysadmin') ||
          hasScope(authHeader, 'performance')
        )
      ) {
        throw new Error('User does not have enough scope')
      }
      return {
        results: [],
        total: 0 /* @todo */
      }
    },
    async fetchRecordDetailsForVerification(_, { id }, context) {
      throw new Error('Not implemented') /* @todo */
    }
  },

  Mutation: {
    async createEvent(_, { details }, { headers: authHeader }) {
      try {
        await validateBirthDeclarationAttachments(details)
      } catch (error) {
        throw new UserInputError(error.message)
      }

      throw new Error('not implemented') /* @todo */
    },
    async markEventAsValidated(_, { id, details }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!hasScope(authHeader, 'validate')) {
        throw new Error('User does not have a validate scope')
      }
      throw new Error('not implemented') /* @todo */
    },

    async markEventAsRegistered(_, { id, details }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (hasScope(authHeader, 'register')) {
        throw new Error('not implemented') /* @todo */
      } else {
        throw new Error('User does not have a register scope')
      }
    },

    async markEventAsVoided(
      _,
      { id, reason, comment },
      { headers: authHeader }
    ) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        throw new Error('User does not have a register or validate scope')
      }
      throw new Error('not implemented') /* @todo */
    },
    async markEventAsArchived(
      _,
      { id, reason, comment, duplicateTrackingId },
      { headers: authHeader }
    ) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        throw new Error('User does not have a register or validate scope')
      }
      throw new Error('not implemented') /* @todo */
    },
    async markEventAsReinstated(_, { id }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        throw new Error('User does not have a register or validate scope')
      }

      throw new Error('not implemented') /* @todo */
    },
    async markEventAsCertified(_, { id, details }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'certify')) {
        return Promise.reject(new Error('User does not have a certify scope'))
      }
      throw new Error('not implemented') /* @todo */
    },
    async markEventAsIssued(_, { id, details }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'certify')) {
        return Promise.reject(new Error('User does not have a certify scope'))
      }
      throw new Error('not implemented') /* @todo */
    },

    async markEventAsNotDuplicate(_, { id }, { headers: authHeader }) {
      const isAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!isAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        throw new Error('not implemented') /* @todo */
      } else {
        throw new Error('User does not have a register scope')
      }
    },

    async markEventAsDuplicate(
      _,
      { id, reason, comment, duplicateTrackingId },
      { headers: authHeader }
    ) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        throw new Error('User does not have a register or validate scope')
      }
      throw new Error('not implemented') /* @todo */
    }
  }
}
