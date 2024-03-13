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
import User, { IUserRole } from '@user-mgnt/model/user'

interface IVerifyPayload {
  userId: string
  practitionerId: string
  mobile?: string
  email?: string
}

export default async function getUser(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { userId, practitionerId, mobile, email } =
    request.payload as IVerifyPayload
  let criteria = {}

  if (userId) {
    criteria = { ...criteria, _id: userId }
  }
  if (practitionerId) {
    criteria = { ...criteria, practitionerId }
  }
  if (mobile) {
    criteria = { ...criteria, mobile }
  }
  if (email) {
    criteria = { ...criteria, emailForNotification: email }
  }
  const user = await User.findOne(criteria).populate<{
    role: IUserRole
  }>('role')

  if (!user) {
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }
  return user
}

export const getUserRequestSchema = Joi.object({
  userId: Joi.string().optional(),
  email: Joi.string().email().optional(),
  practitionerId: Joi.string().optional(),
  mobile: Joi.string().optional()
})
