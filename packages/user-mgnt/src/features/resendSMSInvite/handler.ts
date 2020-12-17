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
import * as Hapi from 'hapi'
import * as Joi from 'joi'
import User from '@user-mgnt/model/user'
import { unauthorized } from 'boom'
import {
  generateRandomPassword,
  generateSaltedHash
} from '@user-mgnt/utils/hash'
import { hasDemoScope, statuses } from '@user-mgnt/utils/userUtils'
import { sendCredentialsNotification } from '@user-mgnt/features/createUser/service'

interface IResendSMSPayload {
  mobile: string
}

export default async function resendSMSInvite(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let randomPassword = null
  const { mobile } = request.payload as IResendSMSPayload

  const user = await User.findOne({ mobile })

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

  sendCredentialsNotification(user.mobile, user.username, randomPassword, {
    Authorization: request.headers.authorization
  })

  return h.response().code(200)
}

export const requestSchema = Joi.object({
  mobile: Joi.string().required()
})
