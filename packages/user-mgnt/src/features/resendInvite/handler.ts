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
import { hasDemoScope, statuses } from '@user-mgnt/utils/userUtils'
import { sendCredentialsNotification } from '@user-mgnt/features/createUser/service'

interface IResendInvitePayload {
  userId: string
}

export default async function resendInvite(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let randomPassword = null
  const { userId } = request.payload as IResendInvitePayload

  const user = await User.findById(userId)

  if (!user) {
    throw unauthorized()
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

  sendCredentialsNotification(
    user.name,
    user.username,
    randomPassword,
    {
      Authorization: request.headers.authorization
    },
    user.mobile,
    user.emailForNotification
  )

  return h.response().code(200)
}

export const requestSchema = Joi.object({
  userId: Joi.string().required()
})
