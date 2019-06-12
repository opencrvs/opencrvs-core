import * as Hapi from 'hapi'
import * as Joi from 'joi'

import User, { IUser } from '@user-mgnt/model/user'
import { generateSaltedHash } from '@user-mgnt/utils/password'
import { logger } from '@user-mgnt/logger'
import {
  createFhirPractitioner,
  createFhirPractitionerRole,
  postFhir,
  rollback
} from '@user-mgnt/features/createUser/service'

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

    if (user.password) {
      const { hash, salt } = generateSaltedHash(user.password)
      user.salt = salt
      user.passwordHash = hash
      delete user.password
    }
    user.practitionerId = practitionerId
  } catch (err) {
    await rollback(token, practitionerId, roleId)
    logger.error(err)
    // cause an internal server error
    throw err
  }

  // save user in user-mgnt data store
  try {
    await User.create(user)
  } catch (err) {
    logger.error(err)
    await rollback(token, practitionerId, roleId)
    // return 400 if there is a validation error when saving to mongo
    return h.response().code(400)
  }

  return h.response().code(201)
}

export const requestSchema = Joi.object({
  userId: Joi.string().required()
})
