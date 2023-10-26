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
import User, { IUserModel, IUserName } from '@user-mgnt/model/user'
import { unauthorized } from '@hapi/boom'
import {
  generateRandomPassword,
  generateSaltedHash
} from '@user-mgnt/utils/hash'
import { getUserId, hasDemoScope, statuses } from '@user-mgnt/utils/userUtils'
import { NOTIFICATION_SERVICE_URL } from '@user-mgnt/constants'
import { logger } from '@user-mgnt/logger'
import { postUserActionToMetrics } from '@user-mgnt/features/changePhone/handler'
import fetch from 'node-fetch'

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

  try {
    const systemAdminUser: IUserModel | null = await User.findById(
      getUserId({ Authorization: request.headers.authorization })
    )
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
  } catch (err) {
    return h.response().code(400)
  }

  sendPasswordNotification(
    randomPassword,
    {
      Authorization: request.headers.authorization
    },
    user.name,
    user.mobile,
    user.emailForNotification
  )

  return h.response().code(200)
}

export async function sendPasswordNotification(
  password: string,
  authHeader: { Authorization: string },
  userFullName: IUserName[],
  msisdn?: string,
  email?: string
) {
  const url = `${NOTIFICATION_SERVICE_URL}resetPasswordInvite`
  try {
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        msisdn,
        email,
        password,
        userFullName
      }),
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    })
  } catch (err) {
    logger.error(`Unable to send notification for error : ${err}`)
  }
}

export const requestSchema = Joi.object({
  userId: Joi.string().required()
})
