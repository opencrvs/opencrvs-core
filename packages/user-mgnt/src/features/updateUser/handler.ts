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
  generateUsername,
  rollbackUpdateUser,
  getFromFhir,
  createFhirPractitioner,
  createFhirPractitionerRole,
  sendUpdateUsernameNotification,
  getCatchmentAreaIdsByPrimaryOfficeId,
  postFhir
} from '@user-mgnt/features/createUser/service'
import { logger } from '@user-mgnt/logger'
import User, { IUser, IUserModel } from '@user-mgnt/model/user'
import { getUserId, roleScopeMapping } from '@user-mgnt/utils/userUtils'
import { QA_ENV } from '@user-mgnt/constants'
import * as Hapi from '@hapi/hapi'
import * as _ from 'lodash'
import { postUserActionToMetrics } from '@user-mgnt/features/changePhone/handler'

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
  const existingPractitioner = await getFromFhir(
    token,
    `/Practitioner/${existingUser.practitionerId}`
  )
  const existingPractitionerRoleBundle: fhir.Bundle = await getFromFhir(
    token,
    `/PractitionerRole?practitioner=${existingUser.practitionerId}`
  )
  let existingPractitionerRole: fhir.PractitionerRole
  if (
    !existingPractitionerRoleBundle ||
    !existingPractitionerRoleBundle.entry ||
    !existingPractitionerRoleBundle.entry[0] ||
    !existingPractitionerRoleBundle.entry[0].resource
  ) {
    throw new Error(
      `No PractitionerRole by given id in bundle: ${existingUser.practitionerId}`
    )
  } else {
    existingPractitionerRole = existingPractitionerRoleBundle.entry[0]
      .resource as fhir.PractitionerRole
  }
  // Update existing user's fields
  existingUser.name = user.name
  existingUser.identifiers = user.identifiers
  existingUser.email = user.email
  existingUser.mobile = user.mobile
  existingUser.emailForNotification = user.emailForNotification
  existingUser.signature = user.signature
  existingUser.localRegistrar = user.localRegistrar
  existingUser.device = user.device
  let changingRole = false
  if (existingUser.systemRole !== user.systemRole) {
    changingRole = true
    existingUser.systemRole = user.systemRole
    // Updating user scope
    const userScopes: string[] =
      roleScopeMapping[existingUser.systemRole || 'FIELD_AGENT']
    if (
      (process.env.NODE_ENV === 'development' || QA_ENV) &&
      !userScopes.includes('demo')
    ) {
      userScopes.push('demo')
    }
    existingUser.scope = userScopes
  }
  existingUser.role = user.role

  if (existingUser.primaryOfficeId !== user.primaryOfficeId) {
    if (request.auth.credentials?.scope?.includes('natlsysadmin')) {
      existingUser.primaryOfficeId = user.primaryOfficeId
      existingUser.catchmentAreaIds =
        await getCatchmentAreaIdsByPrimaryOfficeId(user.primaryOfficeId, token)
    } else {
      throw new Error('Location can be changed only by National System Admin')
    }
  }
  const practitioner = createFhirPractitioner(existingUser, false)
  practitioner.id = existingPractitioner.id

  const practitionerId = await postFhir(token, practitioner)
  if (!practitionerId) {
    throw new Error(
      'Practitioner resource not updated correctly, practitioner ID not returned'
    )
  }
  const practitionerRole = await createFhirPractitionerRole(
    existingUser,
    existingUser.practitionerId,
    false
  )

  practitionerRole.id = existingPractitionerRole.id
  const practitionerRoleId = await postFhir(token, practitionerRole)
  if (!practitionerRoleId) {
    throw new Error(
      'PractitionerRole resource not updated correctly, practitionerRole ID not returned'
    )
  }
  // Updating user in user-mgnt db
  let userNameChanged = false
  try {
    const newUserName = await generateUsername(
      existingUser.name,
      existingUser.username
    )
    if (newUserName !== existingUser.username) {
      existingUser.username = newUserName
      userNameChanged = true
    }
    if (changingRole && practitionerId !== existingUser.practitionerId) {
      existingUser.practitionerId = practitionerId
    }

    // update user in user-mgnt data store
    await User.update({ _id: existingUser._id }, existingUser)
  } catch (err) {
    logger.error(err)
    await rollbackUpdateUser(
      token,
      existingPractitioner,
      existingPractitionerRole
    )
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
    sendUpdateUsernameNotification(
      user.name,
      existingUser.username,
      {
        Authorization: request.headers.authorization
      },
      user.mobile,
      user.emailForNotification
    )
  }
  const resUser = _.omit(existingUser, ['passwordHash', 'salt'])

  const remoteAddress =
    request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']

  try {
    const systemAdminUser: IUserModel | null = await User.findById(
      getUserId({ Authorization: request.headers.authorization })
    )
    await postUserActionToMetrics(
      'EDIT_USER',
      request.headers.authorization,
      remoteAddress,
      userAgent,
      systemAdminUser?.practitionerId,
      practitionerId
    )
  } catch (err) {
    logger.error(err.message)
  }

  return h.response(resUser).code(201)
}
