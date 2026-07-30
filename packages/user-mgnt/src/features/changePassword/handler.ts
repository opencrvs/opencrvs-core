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
import { generateHash } from '@user-mgnt/utils/hash'
import { logger } from '@opencrvs/commons'
import { statuses } from '@user-mgnt/utils/userUtils'
import { postUserActionToMetrics } from '@user-mgnt/features/changePhone/handler'

interface IChangePasswordPayload {
  userId: string
  existingPassword?: string
  password: string
}

/**
 * Serves the unauthenticated `/changePassword`, which the auth service calls
 * during password retrieval. There the caller has already proven ownership of
 * the account with a one-time code, so no existing password is required.
 * Requests from a logged-in user go through `changeOwnPasswordHandler`.
 */
export default async function changePasswordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const userUpdateData = request.payload as IChangePasswordPayload
  const user: IUserModel | null = await User.findById(userUpdateData.userId)

  if (!user) {
    logger.error(
      `No user details found by given userid: ${userUpdateData.userId}`
    )
    throw unauthorized()
  }
  if (userUpdateData.existingPassword) {
    if (user.status !== statuses.ACTIVE) {
      logger.error(
        `User is not in active state for given userid: ${userUpdateData.userId}`
      )
      // Don't return a 404 as this gives away that this user account exists
      throw unauthorized()
    }
    if (
      generateHash(userUpdateData.existingPassword, user.salt) !==
      user.passwordHash
    ) {
      logger.error(
        `Password didn't match for given userid: ${userUpdateData.userId}`
      )
      // Don't return a 404 as this gives away that this user account exists
      throw unauthorized()
    }
  }

  user.passwordHash = generateHash(userUpdateData.password, user.salt)
  const remoteAddress =
    request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']

  try {
    await User.updateOne({ _id: user._id }, user)
  } catch (err) {
    logger.error(err.message)
    // return 400 if there is a validation error when updating to mongo
    return h.response().code(400)
  }
  try {
    if (!request.headers.authorization) {
      await postUserActionToMetrics(
        'PASSWORD_RESET',
        request.headers.authorization,
        remoteAddress,
        userAgent,
        user.practitionerId
      )
    } else {
      await postUserActionToMetrics(
        'PASSWORD_CHANGED',
        request.headers.authorization,
        remoteAddress,
        userAgent
      )
    }
  } catch (err) {
    logger.error(err)
  }
  return h.response().code(200)
}

/**
 * Serves `/changeUserPassword`, which a logged-in user calls to change their
 * own password. The caller must own the account, so that holding a token can
 * never be turned into setting somebody else's password. Knowledge of the
 * current password is enforced by `changeOwnPasswordRequestSchema`.
 */
export async function changeOwnPasswordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { userId } = request.payload as IChangePasswordPayload
  const tokenOwnerId = request.auth.credentials?.sub

  if (tokenOwnerId !== userId) {
    logger.error(
      `Token owner ${tokenOwnerId} is not allowed to change the password of user: ${userId}`
    )
    // Don't return a 403 as this gives away that this user account exists
    throw unauthorized()
  }

  return changePasswordHandler(request, h)
}

export const changePasswordRequestSchema = Joi.object({
  userId: Joi.string().required(),
  existingPassword: Joi.string().optional(),
  password: Joi.string().required()
})

/**
 * A logged-in user must prove they know the current password. Only the
 * retrieval flow above may omit it.
 */
export const changeOwnPasswordRequestSchema = changePasswordRequestSchema.keys({
  existingPassword: Joi.string().required()
})
