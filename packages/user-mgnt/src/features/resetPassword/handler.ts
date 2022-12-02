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
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import User, { IUserModel } from '@user-mgnt/model/user'
import { unauthorized } from '@hapi/boom'
import {
  generateRandomPassword,
  generateSaltedHash
} from '@user-mgnt/utils/hash'
import { getUserId, hasDemoScope, statuses } from '@user-mgnt/utils/userUtils'
import { NOTIFICATION_SERVICE_URL } from '@user-mgnt/constants'
import { logger } from '@user-mgnt/logger'
import { postUserActionToMetrics } from '@user-mgnt/features/changePhone/handler'

interface IResendSMSPayload {
  applicationName: string
  userId: string
}

export default async function resetPasswordSMSHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let randomPassword = null
  const { userId, applicationName } = request.payload as IResendSMSPayload

  const user = await User.findById(userId)

  const systemAdminUser: IUserModel | null = await User.findById(
    getUserId({ Authorization: request.headers.authorization })
  )

  if (!user) {
    throw unauthorized()
  }

  const remoteAddress =
    request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']

  const subjectPractitionerId = systemAdminUser!.practitionerId

  try {
    await postUserActionToMetrics(
      'SEND_PASSWORD',
      request.headers.authorization,
      remoteAddress,
      userAgent,
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

  sendPasswordNotification(user.mobile, applicationName, randomPassword, {
    Authorization: request.headers.authorization
  })

  return h.response().code(200)
}

export async function sendPasswordNotification(
  msisdn: string,
  applicationName: string,
  password: string,
  authHeader: { Authorization: string }
) {
  const url = `${NOTIFICATION_SERVICE_URL}resetPasswordSMS`
  try {
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        msisdn,
        applicationName,
        password
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
  userId: Joi.string().required(),
  applicationName: Joi.string().required()
})
