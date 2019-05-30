import * as Hapi from 'hapi'
import * as Joi from 'joi'
import fetch from 'node-fetch'

import User, { IUser } from 'src/model/user'
import { FHIR_URL } from 'src/constants'

export default async function createUser(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const user = request.payload as IUser

  // construct Practitioner resource and save them
  const practitioner = createFhirPractitioner(user)
  const practitionerId = await postFhir('123', practitioner)
  if (!practitionerId) {
    throw new Error(
      'Practitioner resource not saved corrects, practitioner if not returned'
    )
  }
  const role = createFhirPractitionerRole(user, practitionerId)
  await postFhir('123', role)

  // save user in user-mgnt data store
  await User.create(user)

  return h.response().code(201)
}

export const requestSchema = Joi.object({
  userId: Joi.string().required()
})

const createFhirPractitioner = (user: IUser): fhir.Practitioner => {
  return {
    resourceType: 'Practitioner',
    identifier: user.identifiers,
    telecom: [
      { system: 'phone', value: user.mobile },
      { system: 'email', value: user.email }
    ],
    name: user.name
  }
}

const createFhirPractitionerRole = (
  user: IUser,
  practitionerId: string
): fhir.PractitionerRole => {
  return {
    resourceType: 'PractitionerRole',
    practitioner: {
      reference: `Practitioner/${practitionerId}`
    },
    code: [
      {
        coding: [
          {
            system: `http://opencrvs.org/specs/roles`,
            code: user.role
          }
        ]
      },
      {
        coding: [
          {
            system: `http://opencrvs.org/specs/types`,
            code: user.type
          }
        ]
      }
    ],
    location: user.catchmentAreaIds.concat(user.primaryOfficeId).map(id => ({
      reference: `Location/${id}`
    }))
  }
}

const postFhir = async (token: string, resource: fhir.Resource) => {
  const res = await fetch(`${FHIR_URL}/${resource.resourceType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/fhir+json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(resource)
  })

  if (!res.ok) {
    throw new Error('Unexpected response received')
  }

  const savedResourceLocation = res.headers.get('Location')
  if (savedResourceLocation) {
    return savedResourceLocation.split('/')[1]
  }

  return null
}
