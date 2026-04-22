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
import { unauthorized } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import { findScope, getScopes, hasScope, logger } from '@opencrvs/commons'
import { recordUserAuditEvent } from '@user-mgnt/utils/userAudit'
import {
  generateUsername,
  sendCredentialsNotification
} from '@user-mgnt/features/createUser/service'
import User, { IUser } from '@user-mgnt/model/user'
import {
  generateRandomPassword,
  generateSaltedHash
} from '@user-mgnt/utils/hash'
import { statuses } from '@user-mgnt/utils/userUtils'
import { env } from '@user-mgnt/environment'
import * as _ from 'lodash'
import uuid from 'uuid/v4'

export default async function createUser(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const user = request.payload as IUser & { password?: string }
  const scopes = getScopes(request.headers.authorization as string)
  const creatableRoleIds = findScope(scopes, 'user.create')?.options?.role

  const isDataSeeder = hasScope(
    request.headers.authorization as string,
    'user.data-seeding'
  )

  // If the allowed roles exist and the payload user's role is not included, block unless data seeder
  if (
    Array.isArray(creatableRoleIds) &&
    !creatableRoleIds.includes(user.role) &&
    !isDataSeeder
  ) {
    throw unauthorized()
  }

  const practitionerId: string = uuid()
  let password = null

  try {
    user.status = user.status ?? statuses.PENDING

    // DEFAULT_USER_PASSWORD allows QA/dev environments to set a predictable password
    // for manually created users when SMS/email delivery is unavailable.
    password =
      user.password ?? env.DEFAULT_USER_PASSWORD ?? generateRandomPassword()

    const { hash, salt } = generateSaltedHash(password)
    user.salt = salt
    user.passwordHash = hash

    user.practitionerId = practitionerId
    user.username = user.username ?? (await generateUsername(user.name))
  } catch (err) {
    logger.error(err)
    // cause an internal server error
    throw err
  }

  // save user in user-mgnt data store
  let userModelObject
  try {
    userModelObject = await User.create(user)
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

  sendCredentialsNotification(
    user.name,
    user.username,
    password,
    {
      Authorization: request.headers.authorization as string
    },
    user.mobile,
    user.emailForNotification
  )

  recordUserAuditEvent(request.headers.authorization as string, {
    operation: 'user.create_user',
    requestData: {
      subjectId: userModelObject.id,
      role: user.role,
      primaryOfficeId: user.primaryOfficeId
    }
  })

  const createdUser = userModelObject.toObject()
  const resUser = {
    ..._.omit(createdUser, ['passwordHash', 'salt']),
    id: createdUser._id
  }
  return h.response(resUser).code(201)
}
