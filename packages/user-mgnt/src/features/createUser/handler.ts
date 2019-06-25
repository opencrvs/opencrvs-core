import {
  createFhirPractitioner,
  createFhirPractitionerRole,
  generateUsername,
  postFhir,
  rollback
} from '@user-mgnt/features/createUser/service'
import { logger } from '@user-mgnt/logger'
import User, { IUser } from '@user-mgnt/model/user'
import {
  generateSaltedHash,
  generateRandomPassowrd
} from '@user-mgnt/utils/hash'
import { statuses } from '@user-mgnt/utils/userUtils'
import * as Hapi from 'hapi'

export default async function createUser(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const user = request.payload as IUser & { password: string }
  const token = request.headers.authorization

  // construct Practitioner resource and save them
  let practitionerId = null
  let roleId = null
  try {
    const practitioner = createFhirPractitioner(user)
    practitionerId = await postFhir(token, practitioner)
    if (!practitionerId) {
      throw new Error(
        'Practitioner resource not saved correctly, practitioner ID not returned'
      )
    }
    const role = createFhirPractitionerRole(user, practitionerId)
    roleId = await postFhir(token, role)
    if (!roleId) {
      throw new Error(
        'PractitionerRole resource not saved correctly, practitionerRole ID not returned'
      )
    }

    user.status = statuses.PENDING

    const { hash, salt } = generateSaltedHash(generateRandomPassowrd())
    user.salt = salt
    user.passwordHash = hash

    user.practitionerId = practitionerId
  } catch (err) {
    await rollback(token, practitionerId, roleId)
    logger.error(err)
    // cause an internal server error
    throw err
  }

  // save user in user-mgnt data store
  try {
    user.username = await generateUsername(user.name)
    await User.create(user)
  } catch (err) {
    logger.error(err)
    await rollback(token, practitionerId, roleId)
    // return 400 if there is a validation error when saving to mongo
    return h.response().code(400)
  }

  return h.response().code(201)
}
