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
import User from '@user-mgnt/model/user'
import { getPractitionerSignature } from './service'
import { logger } from '@opencrvs/commons'

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
  const token = request.headers.authorization

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
  const result = await User.findOne(criteria)

  if (!result) {
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  let signature
  try {
    signature = await getPractitionerSignature(token, result.practitionerId)
  } catch {
    logger.error(
      'Error fetching practitioner signature. Sending user without it.'
    )
  }

  const user = result.toObject()
  return { ...user, id: user._id, signature: signature }
}

export const getUserRequestSchema = Joi.object({
  userId: Joi.string().optional(),
  email: Joi.string().email().optional(),
  practitionerId: Joi.string().optional(),
  mobile: Joi.string().optional()
})
