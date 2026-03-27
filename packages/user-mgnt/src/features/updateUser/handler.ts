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
import {
  logger,
  isBase64FileString,
  triggerUserEventNotification,
  personNameFromV1ToV2,
  findScope
} from '@opencrvs/commons'
import { getScopes, SCOPES } from '@opencrvs/commons/authentication'
import { recordUserAuditEvent } from '@user-mgnt/utils/userAudit'
import {
  generateUsername,
  uploadSignatureToMinio
} from '@user-mgnt/features/createUser/service'
import User, { IUser, IUserModel } from '@user-mgnt/model/user'

import * as _ from 'lodash'
import { COUNTRY_CONFIG_URL } from '@user-mgnt/constants'
import { unauthorized } from '@hapi/boom'

export default async function updateUser(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const user = request.payload as IUser & { id: string }
  const token = request.headers.authorization
  const existingUser: IUserModel | null = await User.findOne({ _id: user.id })

  if (!existingUser) {
    throw new Error(`No user found by given id: ${user.id}`)
  }
  const scopes = getScopes(request.headers.authorization)
  const editableRoleIds = findScope(scopes, 'user.edit')?.options?.role

  if (Array.isArray(editableRoleIds) && !editableRoleIds.includes(user.role)) {
    throw unauthorized()
  }

  // Update existing user's fields
  existingUser.name = user.name
  existingUser.email = user.email
  existingUser.mobile = user.mobile
  existingUser.fullHonorificName = user.fullHonorificName
  existingUser.emailForNotification = user.emailForNotification
  existingUser.localRegistrar = user.localRegistrar
  existingUser.device = user.device
  existingUser.role = user.role

  if (existingUser.primaryOfficeId !== user.primaryOfficeId) {
    if (request.auth.credentials?.scope?.includes(SCOPES.CONFIG_UPDATE_ALL)) {
      existingUser.primaryOfficeId = user.primaryOfficeId
    } else {
      throw new Error('Location can not be changed by this user')
    }
  }

  if (user.signature && isBase64FileString(user.signature.data)) {
    await uploadSignatureToMinio(token, user.signature)
  }
  if (user.signature) {
    existingUser.signature = user.signature
  }

  // Updating user in user-mgnt db
  let userNameChanged = false
  const oldUsername = existingUser.username
  let newUserName = existingUser.username
  try {
    newUserName = await generateUsername(
      existingUser.name,
      existingUser.username
    )
    if (newUserName !== existingUser.username) {
      existingUser.username = newUserName
      userNameChanged = true
    }

    // update user in user-mgnt data store
    await User.update({ _id: existingUser._id }, existingUser)
  } catch (err) {
    logger.error(err)
    if (err.code === 11000) {
      // check if phone or email has thrown unique constraint errors
      const errorThrowingProperty =
        err.keyPattern && Object.keys(err.keyPattern)[0]
      return h.response({ errorThrowingProperty }).code(403)
    }
    // return 400 if there is a validation error when saving to mongo
    return h.response().code(400)
  }

  if (userNameChanged) {
    triggerUserEventNotification({
      event: 'user-updated',
      payload: {
        recipient: {
          name: personNameFromV1ToV2(user.name),
          email: user.emailForNotification,
          mobile: user.mobile
        },
        oldUsername,
        newUsername: newUserName
      },
      countryConfigUrl: COUNTRY_CONFIG_URL,
      authHeader: { Authorization: request.headers.authorization }
    })
  }
  const resUser = _.omit(existingUser, ['passwordHash', 'salt'])

  recordUserAuditEvent(request.headers.authorization, {
    operation: 'user.EDIT_USER',
    requestData: { subjectId: user.id },
    responseSummary: {}
  })

  return h.response(resUser).code(201)
}
