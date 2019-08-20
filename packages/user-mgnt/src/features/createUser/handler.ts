import {
  createFhirPractitioner,
  createFhirPractitionerRole,
  createFhirSignature,
  generateUsername,
  postFhir,
  rollback,
  sendCredentialsNotification
} from '@user-mgnt/features/createUser/service'
import { logger } from '@user-mgnt/logger'
import User, { IUser } from '@user-mgnt/model/user'
import {
  generateSaltedHash,
  generateRandomPassowrd
} from '@user-mgnt/utils/hash'
import {
  statuses,
  roleScopeMapping,
  hasDemoScope
} from '@user-mgnt/utils/userUtils'
import * as Hapi from 'hapi'
import * as _ from 'lodash'

export default async function createUser(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const user = request.payload as IUser & { password: string }
  const token = request.headers.authorization

  // construct Practitioner resource and save them
  let practitionerId = null
  let roleId = null
  let autoGenPassword = null
  let signatureId = null

  try {
    const practitioner = createFhirPractitioner(user)
    practitionerId = await postFhir(token, practitioner)
    if (!practitionerId) {
      throw new Error(
        'Practitioner resource not saved correctly, practitioner ID not returned'
      )
    }
    user.role = user.role ? user.role : 'FIELD_AGENT'
    const role = createFhirPractitionerRole(user, practitionerId)
    roleId = await postFhir(token, role)
    if (!roleId) {
      throw new Error(
        'PractitionerRole resource not saved correctly, practitionerRole ID not returned'
      )
    }

    user.status = statuses.PENDING
    user.scope = roleScopeMapping[user.role]

    // check user scope of register to push the signature
    if (user.scope.includes('register')) {
      const signature = createFhirSignature(user, practitionerId)
      signatureId = await postFhir(token, signature)
    }

    autoGenPassword = generateRandomPassowrd(hasDemoScope(request))

    const { hash, salt } = generateSaltedHash(autoGenPassword)
    user.salt = salt
    user.passwordHash = hash

    user.practitionerId = practitionerId

    user.username = await generateUsername(user.name)
  } catch (err) {
    await rollback(token, practitionerId, roleId, signatureId)
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
    await rollback(token, practitionerId, roleId, signatureId)
    // return 400 if there is a validation error when saving to mongo
    return h.response().code(400)
  }

  sendCredentialsNotification(user.mobile, user.username, autoGenPassword, {
    Authorization: request.headers.authorization
  })

  const resUser = _.omit(userModelObject.toObject(), ['passwordHash', 'salt'])
  return h.response(resUser).code(201)
}
