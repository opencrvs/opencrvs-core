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
import { USER_MANAGEMENT_URL } from '@gateway/constants'
import { postMetrics } from '@gateway/features/fhir/utils'
import {
  IUserModelData,
  IUserPayload,
  IUserSearchPayload
} from '@gateway/features/user/type-resolvers'
import {
  getFullName,
  getUser,
  hasScope,
  inScope,
  isTokenOwner,
  getUserId
} from '@gateway/features/user/utils'
import {
  GQLHumanNameInput,
  GQLResolver,
  GQLSearchFieldAgentResponse,
  GQLUserIdentifierInput,
  GQLUserInput
} from '@gateway/graphql/schema'
import { logger } from '@gateway/logger'
import fetch from 'node-fetch'

export const resolvers: GQLResolver = {
  Query: {
    async getUser(_, { userId }, authHeader) {
      return await getUser({ userId }, authHeader)
    },

    async searchUsers(
      _,
      {
        username = null,
        mobile = null,
        role = null,
        status = null,
        primaryOfficeId = null,
        locationId = null,
        count = 10,
        skip = 0,
        sort = 'desc'
      },
      authHeader
    ) {
      // Only sysadmin or registrar or registration agent should be able to search user
      if (!inScope(authHeader, ['sysadmin', 'register', 'validate'])) {
        return await Promise.reject(
          new Error(
            'Search user is only allowed for sysadmin or registrar or registration agent'
          )
        )
      }

      let payload: IUserSearchPayload = {
        count,
        skip,
        sortOrder: sort
      }
      if (username) {
        payload = { ...payload, username }
      }
      if (mobile) {
        payload = { ...payload, mobile }
      }
      if (role) {
        payload = { ...payload, role }
      }
      if (locationId) {
        payload = { ...payload, locationId }
      }
      if (primaryOfficeId) {
        payload = { ...payload, primaryOfficeId }
      }
      if (status) {
        payload = { ...payload, status }
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}searchUsers`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      return await res.json()
    },

    async searchFieldAgents(
      _,
      {
        locationId,
        language = 'en',
        status = null,
        timeStart,
        timeEnd,
        event,
        count = 10,
        skip = 0,
        sort = 'desc'
      },
      authHeader
    ) {
      // Only sysadmin or registrar or registration agent should be able to search field agents
      if (!inScope(authHeader, ['sysadmin', 'register', 'validate'])) {
        return await Promise.reject(
          new Error(
            'Search field agents is only allowed for sysadmin or registrar or registration agent'
          )
        )
      }

      let payload: IUserSearchPayload = {
        locationId,
        role: 'FIELD_AGENT',
        count,
        skip,
        sortOrder: sort
      }
      if (status) {
        payload = { ...payload, status }
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}searchUsers`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      const userResponse = await res.json()
      if (!userResponse || !userResponse.results || !userResponse.totalItems) {
        logger.error('Invalid result found from search user endpoint')
        return {
          totalItems: 0,
          results: []
        }
      }
      // Loading metrics data by practitioner ids
      const metricsForPractitioners = await postMetrics(
        '/applicationStartedMetricsByPractitioners',
        {
          timeStart,
          timeEnd,
          locationId,
          event,
          practitionerIds: userResponse.results.map(
            (user: IUserModelData) => user.practitionerId
          )
        },
        authHeader
      )

      const fieldAgentList: GQLSearchFieldAgentResponse[] = userResponse.results.map(
        (user: IUserModelData) => {
          const metricsData = metricsForPractitioners.find(
            (metricsForPractitioner: { practitionerId: string }) =>
              metricsForPractitioner.practitionerId === user.practitionerId
          )
          return {
            practitionerId: user.practitionerId,
            fullName: getFullName(user, language),
            type: user.type,
            status: user.status,
            primaryOfficeId: user.primaryOfficeId,
            creationDate: user?.creationDate,
            totalNumberOfApplicationStarted:
              metricsData?.totalNumberOfApplicationStarted ?? 0,
            totalNumberOfInProgressAppStarted:
              metricsData?.totalNumberOfInProgressAppStarted ?? 0,
            totalNumberOfRejectedApplications:
              metricsData?.totalNumberOfRejectedApplications ?? 0,
            averageTimeForDeclaredApplications:
              metricsData?.averageTimeForDeclaredApplications ?? 0
          }
        }
      )

      return {
        results: fieldAgentList,
        totalItems: userResponse.totalItems
      }
    },
    async verifyPasswordById(_, { id, password }, authHeader) {
      const res = await fetch(`${USER_MANAGEMENT_URL}verifyPasswordById`, {
        method: 'POST',
        body: JSON.stringify({ id, password }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        return await Promise.reject(
          new Error('Unauthorized to verify password')
        )
      }

      return await res.json()
    }
  },

  Mutation: {
    async createOrUpdateUser(_, { user }, authHeader) {
      // Only sysadmin should be able to create user
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('Create user is only allowed for sysadmin')
        )
      }
      const userPayload: IUserPayload = createOrUpdateUserPayload(user)
      const action = userPayload.id ? 'update' : 'create'
      const res = await fetch(`${USER_MANAGEMENT_URL}${action}User`, {
        method: 'POST',
        body: JSON.stringify(userPayload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            `Something went wrong on user-mgnt service. Couldn't ${action} user`
          )
        )
      }
      return await res.json()
    },
    async activateUser(_, { userId, password, securityQNAs }, authHeader) {
      const res = await fetch(`${USER_MANAGEMENT_URL}activateUser`, {
        method: 'POST',
        body: JSON.stringify({ userId, password, securityQNAs }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      const response = await res.json()

      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            "Something went wrong on user-mgnt service. Couldn't activate given user"
          )
        )
      }
      return response.userId
    },
    async changePassword(
      _,
      { userId, existingPassword, password },
      authHeader
    ) {
      // Only token owner except sysadmin should be able to change their password
      if (
        !hasScope(authHeader, 'sysadmin') &&
        !isTokenOwner(authHeader, userId)
      ) {
        return await Promise.reject(
          new Error(
            `Change password is not allowed. ${userId} is not the owner of the token`
          )
        )
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}changeUserPassword`, {
        method: 'POST',
        body: JSON.stringify({ userId, existingPassword, password }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        return await Promise.reject(
          new Error(
            "Something went wrong on user-mgnt service. Couldn't change user password"
          )
        )
      }
      return true
    },
    async auditUser(_, { userId, action, reason, comment }, authHeader) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error(
            `User ${userId} is not allowed to audit for not having the sys admin scope`
          )
        )
      }

      const auditedBy = getUserId(authHeader)

      const res = await fetch(`${USER_MANAGEMENT_URL}auditUser`, {
        method: 'POST',
        body: JSON.stringify({
          userId,
          auditedBy,
          action,
          reason,
          comment
        }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        return await Promise.reject(
          new Error(
            `Something went wrong on user-mgnt service. Couldn't audit user ${userId}`
          )
        )
      }

      return true
    },
    async resendSMSInvite(_, { userId }, authHeader) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error(
            'SMS invite can only be resent by a user with sys admin scope'
          )
        )
      }

      const res = await fetch(`${USER_MANAGEMENT_URL}resendSMSInvite`, {
        method: 'POST',
        body: JSON.stringify({
          userId
        }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        return await Promise.reject(
          new Error(
            `Something went wrong on user-mgnt service. Couldn't send sms to ${userId}`
          )
        )
      }

      return true
    }
  }
}

function createOrUpdateUserPayload(user: GQLUserInput): IUserPayload {
  const userPayload: IUserPayload = {
    name: (user.name as GQLHumanNameInput[]).map((name: GQLHumanNameInput) => ({
      use: name.use as string,
      family: name.familyName as string,
      given: (name.firstNames || '').split(' ') as string[]
    })),
    role: user.role as string,
    type: user.type as string,
    identifiers: (user.identifier as GQLUserIdentifierInput[]) || [],
    primaryOfficeId: user.primaryOffice as string,
    email: user.email || '',
    mobile: user.mobile as string,
    device: user.device as string,
    signature: user.signature
  }
  if (user.id) {
    userPayload.id = user.id
  }
  return userPayload
}
