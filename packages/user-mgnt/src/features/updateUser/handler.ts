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
import { logger, isBase64FileString } from '@opencrvs/commons'
import {
  Practitioner,
  findExtension,
  OPENCRVS_SPECIFICATION_URL
} from '@opencrvs/commons/types'
import { SCOPES } from '@opencrvs/commons/authentication'
import { postUserActionToMetrics } from '@user-mgnt/features/changePhone/handler'
import {
  createFhirPractitioner,
  createFhirPractitionerRole,
  generateUsername,
  getFromFhir,
  postFhir,
  rollbackUpdateUser,
  sendUpdateUsernameNotification,
  uploadSignatureToMinio
} from '@user-mgnt/features/createUser/service'
import User, { IUser, IUserModel } from '@user-mgnt/model/user'
import { getUserId } from '@user-mgnt/utils/userUtils'
import * as _ from 'lodash'

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
  const existingPractitioner = (await getFromFhir(
    token,
    `/Practitioner/${existingUser.practitionerId}`
  )) satisfies Practitioner
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
  existingUser.email = user.email
  existingUser.mobile = user.mobile
  existingUser.emailForNotification = user.emailForNotification
  existingUser.signature = user.signature
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

  const existingSignatureAttachment = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/employee-signature`,
    existingPractitioner.extension || []
  )?.valueAttachment

  const signatureAttachment =
    (user.signature &&
      isBase64FileString(user.signature.data) && {
        contentType: user.signature.type,
        url: await uploadSignatureToMinio(token, user.signature),
        creation: new Date().getTime().toString()
      }) ||
    existingSignatureAttachment

  const practitioner = createFhirPractitioner(
    existingUser,
    false,
    signatureAttachment
  )
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
    if (practitionerId !== existingUser.practitionerId) {
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
