import { FHIR_URL } from '@user-mgnt/constants'
import { IUser, IUserName } from '@user-mgnt/model/user'
import UsernameRecord from '@user-mgnt/model/usernameRecord'
import fetch from 'node-fetch'

export const createFhirPractitioner = (user: IUser): fhir.Practitioner => {
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

export const createFhirPractitionerRole = (
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

export const postFhir = async (token: string, resource: fhir.Resource) => {
  const res = await fetch(`${FHIR_URL}/${resource.resourceType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/fhir+json',
      Authorization: token
    },
    body: JSON.stringify(resource)
  })

  if (!res.ok) {
    throw new Error('Unexpected response received')
  }

  const savedResourceLocation = res.headers.get('Location')
  if (savedResourceLocation) {
    const pathParts = savedResourceLocation.split('/')
    const index = pathParts.indexOf(resource.resourceType || '')
    // the identifier is after the resourceType
    return pathParts[index + 1]
  }

  return null
}

export const deleteFhir = async (
  token: string,
  resourceType: string,
  id: string
) => {
  const res = await fetch(`${FHIR_URL}/${resourceType}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/fhir+json',
      Authorization: token
    }
  })

  if (!res.ok) {
    throw new Error('Unexpected response received')
  }
}

export const rollback = async (
  token: string,
  practitionerId: string | null,
  roleId: string | null
) => {
  if (practitionerId) {
    await deleteFhir(token, 'Practitioner', practitionerId)
  }

  if (roleId) {
    await deleteFhir(token, 'PractitionerRole', roleId)
  }
}

export function generateUsername(names: IUserName[]) {
  const { given = [], family = '' } =
    names.find(name => name.use === 'en') || {}
  const initials = given.reduce(
    (accumulated, current) => accumulated + current.trim().charAt(0),
    ''
  )

  let proposedUsername = `${initials}${
    initials === '' ? '' : '.'
  }${family.trim().replace(/ /g, '-')}`.toLowerCase()

  if (proposedUsername.length < 3) {
    proposedUsername =
      proposedUsername + '0'.repeat(3 - proposedUsername.length)
  }

  UsernameRecord.findOne({ username: proposedUsername }).then(
    existingUsername => {
      if (existingUsername !== null) {
        proposedUsername += existingUsername.count
        UsernameRecord.update(
          { username: proposedUsername },
          { $set: { count: existingUsername.count + 1 } }
        )
      } else {
        UsernameRecord.create({ username: proposedUsername, count: 1 })
      }
    }
  )

  return proposedUsername
}
