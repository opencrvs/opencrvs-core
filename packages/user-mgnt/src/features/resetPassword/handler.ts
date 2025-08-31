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
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import User from '@user-mgnt/model/user'
import { unauthorized } from '@hapi/boom'
import {
  generateRandomPassword,
  generateSaltedHash
} from '@user-mgnt/utils/hash'
import { getUserId, hasDemoScope, statuses } from '@user-mgnt/utils/userUtils'
import { COUNTRY_CONFIG_URL } from '@user-mgnt/constants'
import {
  logger,
  triggerUserEventNotification,
  personNameFromV1ToV2
} from '@opencrvs/commons'
import { postUserActionToMetrics } from '@user-mgnt/features/changePhone/handler'

interface IResendPasswordInvitePayload {
  userId: string
}

export default async function resetPasswordInviteHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let randomPassword = null
  const { userId } = request.payload as IResendPasswordInvitePayload

  const user = await User.findById(userId)

  if (!user) {
    throw unauthorized()
  }

  const remoteAddress =
    request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']

  const subjectPractitionerId = user.practitionerId
  const systemAdminUser = await User.findById(
    getUserId({ Authorization: request.headers.authorization })
  )

  if (!systemAdminUser) {
    return h.response().code(400)
  }

  try {
    await postUserActionToMetrics(
      'PASSWORD_RESET_BY_ADMIN',
      request.headers.authorization,
      remoteAddress,
      userAgent,
      systemAdminUser?.practitionerId,
      subjectPractitionerId
    )
  } catch (err) {
    logger.error(err)
  }

  randomPassword = generateRandomPassword(hasDemoScope(request))
  const { hash, salt } = generateSaltedHash(randomPassword)

  user.passwordHash = hash
  user.salt = salt
  user.status = statuses.PENDING

  try {
    await User.update({ _id: user._id }, user)
    await triggerUserEventNotification({
      event: 'reset-password-by-admin',
      payload: {
        temporaryPassword: randomPassword,
        recipient: {
          name: personNameFromV1ToV2(user.name),
          email: user.emailForNotification,
          mobile: user.mobile
        },
        admin: {
          name: personNameFromV1ToV2(systemAdminUser.name),
          id: systemAdminUser.id,
          role: systemAdminUser.role
        }
      },
      countryConfigUrl: COUNTRY_CONFIG_URL,
      authHeader: {
        Authorization: request.headers.authorization
      }
    })
  } catch (err) {
    return h.response().code(400)
  }
  return h.response().code(200)
}
export const requestSchema = Joi.object({
  userId: Joi.string().required()
})
