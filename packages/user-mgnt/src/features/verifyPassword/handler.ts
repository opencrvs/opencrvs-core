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
import { unauthorized } from '@hapi/boom'
import User, { IUserModel, IUserName } from '@user-mgnt/model/user'
import { generateHash, generateOldHash } from '@user-mgnt/utils/hash'

interface IVerifyPayload {
  username: string
  password: string
}

interface IVerifyResponse {
  name: IUserName[]
  mobile?: string
  email?: string
  scope: string[]
  status: string
  id: string
  practitionerId: string
}

export default async function verifyPassHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { username, password } = request.payload as IVerifyPayload

  const user: IUserModel | null = await User.findOne({ username })

  if (!user) {
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }
  /*
   * In OCRVS-4979 we needed to change the hashing algorithm to conform latest security standards.
   * We still need to support users logging in with the old password hash to allow them to change their passwords to the new hash.
   *
   * TODO: In OpenCRVS 1.4, remove this check and force any users without new password hash to reset their password via sys admin.
   */
  if (!user.passwordHash) {
    if (generateOldHash(password, user.salt) !== user.oldPasswordHash) {
      throw unauthorized()
    }
  } else if (generateHash(password, user.salt) !== user.passwordHash) {
    throw unauthorized()
  }
  const response: IVerifyResponse = {
    name: user.name,
    mobile: user.mobile,
    email: user.emailForNotification,
    scope: user.scope,
    status: user.status,
    id: user.id,
    practitionerId: user.practitionerId
  }
  return response
}

export const requestSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
})

export const responseSchema = Joi.object({
  name: Joi.array().items(
    Joi.object({
      given: Joi.array().items(Joi.string()).required(),
      use: Joi.string().required(),
      family: Joi.string().required()
    }).unknown(true)
  ),
  mobile: Joi.string().optional(),
  email: Joi.string().allow(null, '').optional(),
  scope: Joi.array().items(Joi.string()),
  status: Joi.string(),
  id: Joi.string(),
  practitionerId: Joi.string()
})
