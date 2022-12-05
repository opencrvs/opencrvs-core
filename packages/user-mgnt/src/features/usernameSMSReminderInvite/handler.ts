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
import { sendUserName } from './service'
import { postUserActionToMetrics } from '@user-mgnt/features/changePhone/handler'
import { logger } from '@user-mgnt/logger'
import { getUserId } from '@user-mgnt/utils/userUtils'

interface IResendUsernameSMSPayload {
  userId: string
}

export default async function usernameSMSReminderHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { userId } = request.payload as IResendUsernameSMSPayload

  const user = await User.findById(userId)

  if (!user) {
    throw unauthorized()
  }

  await sendUserName(user.mobile, user.username, {
    Authorization: request.headers.authorization
  })

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
      'USERNAME_REMINDER_BY_ADMIN',
      request.headers.authorization,
      remoteAddress,
      userAgent,
      systemAdminUser?.practitionerId,
      subjectPractitionerId
    )
  } catch (err) {
    logger.error(err)
  }

  return h.response(user).code(200)
}

export const requestSchema = Joi.object({
  userId: Joi.string().required()
})
