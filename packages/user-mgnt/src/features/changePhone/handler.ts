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
import { unauthorized } from '@hapi/boom'
import User, { IUserModel } from '@user-mgnt/model/user'
import { logger } from '@user-mgnt/logger'
import { statuses } from '@user-mgnt/utils/userUtils'
import { resolve } from 'url'
import fetch from 'node-fetch'
import { METRICS_URL } from '@user-mgnt/constants'

interface IChangePasswordPayload {
  userId: string
  phoneNumber: string
}

export default async function changePhoneHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const userUpdateData = request.payload as IChangePasswordPayload
  const user: IUserModel | null = await User.findById(userUpdateData.userId)
  const remoteAddress =
    request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']
  if (!user) {
    logger.error(
      `No user details found by given userid: ${userUpdateData.userId}`
    )
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  if (userUpdateData.phoneNumber) {
    if (user.status !== statuses.ACTIVE) {
      logger.error(
        `User is not in active state for given userid: ${userUpdateData.userId}`
      )
      // Don't return a 404 as this gives away that this user account exists
      throw unauthorized()
    }
    user.mobile = userUpdateData.phoneNumber
  }

  try {
    await User.update({ _id: user._id }, user)
  } catch (err) {
    // return 400 if there is a validation error when updating to mongo
    return h.response(err.message).code(400)
  }
  try {
    await postUserActionToMetrics(
      'PHONE_NUMBER_CHANGED',
      request.headers.authorization,
      remoteAddress,
      userAgent
    )
  } catch (err) {
    logger.error(err)
  }
  return h.response().code(200)
}

export async function postUserActionToMetrics(
  action: string,
  token: string,
  remoteAddress: string,
  userAgent: string,
  practitionerId?: string,
  subjectPractitionerId?: string
) {
  const url = resolve(METRICS_URL, '/audit/events')
  const body = {
    action,
    practitionerId,
    ...(subjectPractitionerId && { additionalData: { subjectPractitionerId } })
  }
  const authentication = 'Bearer ' + token
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: authentication,
      'x-real-ip': remoteAddress,
      'x-real-user-agent': userAgent
    }
  })
}
export const changePhoneRequestSchema = Joi.object({
  userId: Joi.string().required(),
  phoneNumber: Joi.string().required()
})
