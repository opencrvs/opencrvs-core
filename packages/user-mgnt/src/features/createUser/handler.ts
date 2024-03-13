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
import {
  createFhirPractitioner,
  createFhirPractitionerRole,
  generateUsername,
  postFhir,
  rollbackCreateUser,
  sendCredentialsNotification,
  getCatchmentAreaIdsByPrimaryOfficeId
} from '@user-mgnt/features/createUser/service'
import { logger } from '@user-mgnt/logger'
import User, { IUser, IUserModel } from '@user-mgnt/model/user'
import {
  generateSaltedHash,
  generateRandomPassword
} from '@user-mgnt/utils/hash'
import { statuses, hasDemoScope, getUserId } from '@user-mgnt/utils/userUtils'
import { userRoleScopes } from '@opencrvs/commons/authentication'
import { QA_ENV } from '@user-mgnt/constants'
import * as Hapi from '@hapi/hapi'
import * as _ from 'lodash'
import { postUserActionToMetrics } from '@user-mgnt/features/changePhone/handler'

export default async function createUser(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const user = request.payload as IUser & { password?: string }
  const token = request.headers.authorization

  // construct Practitioner resource and save them
  let practitionerId = null
  let roleId = null
  let password = null

  try {
    const practitioner = createFhirPractitioner(user, false)
    practitionerId = await postFhir(token, practitioner)
    if (!practitionerId) {
      throw new Error(
        'Practitioner resource not saved correctly, practitioner ID not returned'
      )
    }
    user.catchmentAreaIds = await getCatchmentAreaIdsByPrimaryOfficeId(
      user.primaryOfficeId,
      token
    )
    user.systemRole = user.systemRole ?? 'FIELD_AGENT'

    const role = await createFhirPractitionerRole(user, practitionerId, false)
    roleId = await postFhir(token, role)
    if (!roleId) {
      throw new Error(
        'PractitionerRole resource not saved correctly, practitionerRole ID not returned'
      )
    }
    const userScopes: string[] = userRoleScopes[user.systemRole]
    if (
      (process.env.NODE_ENV === 'development' || QA_ENV) &&
      !userScopes.includes('demo')
    ) {
      userScopes.push('demo')
    }
    user.status = user.status ?? statuses.PENDING
    user.scope = userScopes

    password = user.password ?? generateRandomPassword(hasDemoScope(request))

    const { hash, salt } = generateSaltedHash(password)
    user.salt = salt
    user.passwordHash = hash

    user.practitionerId = practitionerId
    user.username = user.username ?? (await generateUsername(user.name))
  } catch (err) {
    await rollbackCreateUser(token, practitionerId, roleId)
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
    await rollbackCreateUser(token, practitionerId, roleId)
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
      Authorization: request.headers.authorization
    },
    user.mobile,
    user.emailForNotification
  )

  const remoteAddress =
    request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']

  try {
    const systemAdminUser: IUserModel | null = await User.findById(
      getUserId({ Authorization: request.headers.authorization })
    )
    await postUserActionToMetrics(
      'CREATE_USER',
      request.headers.authorization,
      remoteAddress,
      userAgent,
      systemAdminUser?.practitionerId,
      practitionerId
    )
  } catch (err) {
    logger.error(err.message)
  }

  const resUser = _.omit(userModelObject.toObject(), ['passwordHash', 'salt'])
  return h.response(resUser).code(201)
}
