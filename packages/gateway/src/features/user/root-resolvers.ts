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
import { USER_MANAGEMENT_URL } from '@gateway/constants'

import {
  IUserModelData,
  IUserPayload,
  IUserSearchPayload
} from '@gateway/features/user/type-resolvers'
import {
  getFullName,
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
import { checkVerificationCode } from '@gateway/routes/verifyCode/handler'
import { UserInputError } from 'apollo-server-hapi'
import fetch from '@gateway/fetch'
import { validateAttachments } from '@gateway/utils/validators'
import { postMetrics } from '@gateway/features/metrics/service'
import { uploadBase64ToMinio } from '@gateway/features/documents/service'
import { isBase64FileString } from '@opencrvs/commons'
import { rateLimitedResolver } from '@gateway/rate-limit'

export const resolvers: GQLResolver = {
  Query: {
    getUser: rateLimitedResolver(
      { requestsPerMinute: 10 },
      async (_, { userId }, { dataSources }) => {
        const user = await dataSources.usersAPI.getUserById(userId!)
        return user
      }
    ),

    getUserByMobile: rateLimitedResolver(
      { requestsPerMinute: 10 },
      async (_, { mobile }, { dataSources }) => {
        return dataSources.usersAPI.getUserByMobile(mobile!)
      }
    ),

    getUserByEmail: rateLimitedResolver(
      { requestsPerMinute: 10 },
      (_, { email }, { dataSources }) => {
        return dataSources.usersAPI.getUserByEmail(email!)
      }
    ),

    searchUsers: rateLimitedResolver(
      { requestsPerMinute: 10 },
      async (
        _,
        {
          username = null,
          mobile = null,
          systemRole = null,
          status = null,
          primaryOfficeId = null,
          locationId = null,
          count = 10,
          skip = 0,
          sort = 'desc'
        },
        { headers: authHeader }
      ) => {
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
        if (systemRole) {
          payload = { ...payload, systemRole }
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
      }
    ),

    searchFieldAgents: rateLimitedResolver(
      { requestsPerMinute: 10 },
      async (
        _,
        {
          locationId,
          primaryOfficeId,
          language = 'en',
          status = null,
          timeStart,
          timeEnd,
          event,
          count = 10,
          skip = 0,
          sort = 'desc'
        },
        { headers: authHeader }
      ) => {
        // Only sysadmin or registrar or registration agent should be able to search field agents
        if (!inScope(authHeader, ['sysadmin', 'register', 'validate'])) {
          return await Promise.reject(
            new Error(
              'Search field agents is only allowed for sysadmin or registrar or registration agent'
            )
          )
        }

        if (!locationId && !primaryOfficeId) {
          logger.error('No location provided')
          return {
            totalItems: 0,
            results: []
          }
        }

        let payload: IUserSearchPayload = {
          systemRole: 'FIELD_AGENT',
          count,
          skip,
          sortOrder: sort
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
        const userResponse = await res.json()
        if (
          !userResponse ||
          !userResponse.results ||
          !userResponse.totalItems
        ) {
          logger.error('Invalid result found from search user endpoint')
          return {
            totalItems: 0,
            results: []
          }
        }
        // Loading metrics data by practitioner ids
        const metricsForPractitioners = await postMetrics(
          '/declarationStartedMetricsByPractitioners',
          {
            timeStart,
            timeEnd,
            locationId: locationId ? locationId : (primaryOfficeId as string),
            event,
            practitionerIds: userResponse.results.map(
              (user: IUserModelData) => user.practitionerId
            )
          },
          authHeader
        )

        const fieldAgentList: GQLSearchFieldAgentResponse[] =
          userResponse.results.map((user: IUserModelData) => {
            const metricsData = metricsForPractitioners.find(
              (metricsForPractitioner: { practitionerId: string }) =>
                metricsForPractitioner.practitionerId === user.practitionerId
            )
            return {
              practitionerId: user.practitionerId,
              fullName: getFullName(user, language),
              role: user.role,
              status: user.status,
              avatar: user.avatar,
              primaryOfficeId: user.primaryOfficeId,
              creationDate: user?.creationDate,
              totalNumberOfDeclarationStarted:
                metricsData?.totalNumberOfDeclarationStarted ?? 0,
              totalNumberOfInProgressAppStarted:
                metricsData?.totalNumberOfInProgressAppStarted ?? 0,
              totalNumberOfRejectedDeclarations:
                metricsData?.totalNumberOfRejectedDeclarations ?? 0,
              averageTimeForDeclaredDeclarations:
                metricsData?.averageTimeForDeclaredDeclarations ?? 0
            }
          })

        return {
          results: fieldAgentList,
          totalItems: userResponse.totalItems
        }
      }
    ),

    verifyPasswordById: rateLimitedResolver(
      { requestsPerMinute: 10 },
      async (_, { id, password }, { headers: authHeader }) => {
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
    )
  },

  Mutation: {
    async createOrUpdateUser(_, { user }, { headers: authHeader }) {
      // Only sysadmin should be able to create user
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('Create user is only allowed for sysadmin')
        )
      }

      try {
        if (user.signature) {
          await validateAttachments([user.signature])
        }
      } catch (error) {
        throw new UserInputError(error.message)
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

      if (res.status === 403) {
        const errorResponse = await res.json()
        const duplicateDataErrorMap = {
          emailForNotification: {
            field: 'email',
            conflictingValue: userPayload.emailForNotification
          },
          mobile: {
            field: 'mobile',
            conflictingValue: userPayload.mobile
          }
        }

        throw new UserInputError(errorResponse.message, {
          duplicateNotificationMethodError:
            duplicateDataErrorMap[
              errorResponse[
                'errorThrowingProperty'
              ] as keyof typeof duplicateDataErrorMap
            ]
        })
      } else if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            `Something went wrong on user-mgnt service. Couldn't ${action} user`
          )
        )
      }
      return await res.json()
    },
    async activateUser(
      _,
      { userId, password, securityQNAs },
      { headers: authHeader }
    ) {
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
      { headers: authHeader }
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
    async changePhone(
      _,
      { userId, phoneNumber, nonce, verifyCode },
      { headers: authHeader }
    ) {
      if (!isTokenOwner(authHeader, userId)) {
        return await Promise.reject(
          new Error(
            `Change phone is not allowed. ${userId} is not the owner of the token`
          )
        )
      }
      try {
        await checkVerificationCode(nonce, verifyCode)
      } catch (err) {
        logger.error(err)
        return await Promise.reject(
          new Error(`Change phone is not allowed. Error: ${err}`)
        )
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}changeUserPhone`, {
        method: 'POST',
        body: JSON.stringify({ userId, phoneNumber }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        return await Promise.reject(
          new Error(
            "Something went wrong on user-mgnt service. Couldn't change user phone number"
          )
        )
      }
      return true
    },
    async changeEmail(
      _,
      { userId, email, nonce, verifyCode },
      { headers: authHeader }
    ) {
      if (!isTokenOwner(authHeader, userId)) {
        return await Promise.reject(
          new Error(
            `Change email is not allowed. ${userId} is not the owner of the token`
          )
        )
      }
      try {
        await checkVerificationCode(nonce, verifyCode)
      } catch (err) {
        logger.error(err)
        return await Promise.reject(
          new Error(`Change email is not allowed. Error: ${err}`)
        )
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}changeUserEmail`, {
        method: 'POST',
        body: JSON.stringify({ userId, email }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        return await Promise.reject(
          new Error(
            "Something went wrong on user-mgnt service. Couldn't change user email"
          )
        )
      }
      return true
    },
    async changeAvatar(_, { userId, avatar }, { headers: authHeader }) {
      try {
        await validateAttachments([avatar])
      } catch (error) {
        throw new UserInputError(error.message)
      }

      // Only token owner should be able to change their avatar
      if (!isTokenOwner(authHeader, userId)) {
        return await Promise.reject(
          new Error(
            `Changing avatar is not allowed. ${userId} is not the owner of the token`
          )
        )
      }

      if (isBase64FileString(avatar.data)) {
        const docUploadResponse = await uploadBase64ToMinio(
          avatar.data,
          authHeader
        )
        avatar.data = docUploadResponse
      }

      const res = await fetch(`${USER_MANAGEMENT_URL}changeUserAvatar`, {
        method: 'POST',
        body: JSON.stringify({ userId, avatar }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        return await Promise.reject(
          new Error(
            "Something went wrong on user-mgnt service. Couldn't change user avatar"
          )
        )
      }
      return avatar
    },
    async auditUser(
      _,
      { userId, action, reason, comment },
      { headers: authHeader }
    ) {
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
    async resendInvite(_, { userId }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error(
            'SMS invite can only be resent by a user with sys admin scope'
          )
        )
      }

      const res = await fetch(`${USER_MANAGEMENT_URL}resendInvite`, {
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
    },
    async usernameReminder(_, { userId }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error(
            'Username reminder can only be resent by a user with sys admin scope'
          )
        )
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}usernameReminder`, {
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
    },
    async resetPasswordInvite(_, { userId }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error(
            'Reset password can only be sent by a user with sys admin scope'
          )
        )
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}resetPasswordInvite`, {
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
            `Something went wrong on user-mgnt service. Couldn't reset password and send sms to ${userId}`
          )
        )
      }

      return true
    }
  }
}

function createOrUpdateUserPayload(user: GQLUserInput): IUserPayload {
  const userPayload: IUserPayload = {
    name: user.name.map((name: GQLHumanNameInput) => ({
      use: name.use as string,
      family: name.familyName?.trim() as string,
      given: (name.firstNames || '')?.trim().split(' ') as string[]
    })),
    systemRole: user.systemRole as string,
    role: user.role as string,
    ...(user.password && { password: user.password }),
    ...(user.status && { status: user.status }),
    identifiers: (user.identifier as GQLUserIdentifierInput[]) || [],
    primaryOfficeId: user.primaryOffice as string,
    email: '',
    ...(user.email && { emailForNotification: user.email }), //instead of saving data in email, we want to store it in emailForNotification property
    ...(user.mobile && { mobile: user.mobile as string }),
    device: user.device as string,
    signature: user.signature,
    ...(user.username && { username: user.username })
  }
  if (user.id) {
    userPayload.id = user.id
  }
  return userPayload
}
