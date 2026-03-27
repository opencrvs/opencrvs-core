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
import { logger } from '@opencrvs/commons'
import { statuses } from '@user-mgnt/utils/userUtils'
import { recordUserAuditEvent } from '@user-mgnt/utils/userAudit'

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
  recordUserAuditEvent(request.headers.authorization, {
    operation: 'user.PHONE_NUMBER_CHANGED',
    requestData: { subjectId: userUpdateData.userId },
    responseSummary: { phoneNumber: userUpdateData.phoneNumber }
  })
  return h.response().code(200)
}
export const changePhoneRequestSchema = Joi.object({
  userId: Joi.string().required(),
  phoneNumber: Joi.string().required()
})
