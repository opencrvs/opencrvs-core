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
import User, { IUserModel } from '@user-mgnt/model/user'
import { unauthorized } from '@hapi/boom'
import {
  logger,
  triggerUserEventNotification,
  personNameFromV1ToV2
} from '@opencrvs/commons'
import { getUserId } from '@user-mgnt/utils/userUtils'
import { COUNTRY_CONFIG_URL } from '@user-mgnt/constants'
import { recordUserAuditEvent } from '@user-mgnt/utils/userAudit'

interface IResendUsernameSMSPayload {
  userId: string
}

export default async function usernameReminderHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { userId } = request.payload as IResendUsernameSMSPayload

  const user = await User.findById(userId)

  if (!user) {
    throw unauthorized()
  }

  try {
    await triggerUserEventNotification({
      event: 'username-reminder',
      payload: {
        recipient: {
          name: personNameFromV1ToV2(user.name),
          email: user.emailForNotification,
          mobile: user.mobile
        },
        username: user.username
      },
      countryConfigUrl: COUNTRY_CONFIG_URL,
      authHeader: { Authorization: request.headers.authorization }
    })

    const systemAdminUser: IUserModel | null = await User.findById(
      getUserId({ Authorization: request.headers.authorization })
    )
    if (systemAdminUser) {
      recordUserAuditEvent(request.headers.authorization, {
        operation: 'user.username_reminder_by_admin',
        requestData: { subjectId: userId },
      })
    }
  } catch (err) {
    logger.error(err)
  }

  return h.response(user).code(200)
}

export const requestSchema = Joi.object({
  userId: Joi.string().required()
})
