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
import { logger } from '@opencrvs/commons'
import {
  Extension,
  findExtension,
  OPENCRVS_SPECIFICATION_URL
} from '@opencrvs/commons/types'
import {
  DOCUMENTS_URL,
  FHIR_URL,
  NOTIFICATION_SERVICE_URL
} from '@user-mgnt/constants'
import User, {
  ISignature,
  ISignatureAttachment,
  IUser,
  IUserName
} from '@user-mgnt/model/user'
import fetch from 'node-fetch'

export const createFhirPractitioner = (
  user: IUser,
  system: boolean,
  signatureAttachment?: ISignatureAttachment
): fhir.Practitioner => {
  if (system) {
    return {
      resourceType: 'Practitioner',
      telecom: [
        { system: 'phone', value: user.mobile },
        { system: 'email', value: user.emailForNotification }
      ],
      name: [
        {
          use: '',
          family: 'SYSTEM',
          given: ['AUTOMATED']
        }
      ]
    }
  } else {
    return {
      resourceType: 'Practitioner',
      telecom: [
        { system: 'phone', value: user.mobile },
        { system: 'email', value: user.emailForNotification }
      ],
      name: user.name,
      extension: signatureAttachment && [
        {
          url: 'http://opencrvs.org/specs/extension/employee-signature',
          valueAttachment: signatureAttachment
        }
      ]
    }
  }
}

export const uploadSignatureToMinio = async (
  token: string,
  signature: ISignature
) => {
  const result = await fetch(`${DOCUMENTS_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fileData: signature.data })
  })
  const res = await result.json()
  return res.refUrl
}

export const getSignatureExtension = (extensions: Extension[] | undefined) => {
  return findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/employee-signature`,
    extensions || []
  )
}

export const createFhirPractitionerRole = async (
  user: IUser,
  practitionerId: string,
  system: boolean
): Promise<fhir.PractitionerRole> => {
  if (system) {
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
              code: 'AUTOMATED'
            }
          ]
        }
      ],
      location: [{ reference: `Location/${user.primaryOfficeId}` }]
    }
  } else {
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
        }
      ],
      location: [{ reference: `Location/${user.primaryOfficeId}` }]
    }
  }
}

export const postFhir = async (token: string, resource: fhir.Resource) => {
  const shouldUpdateExisting = Boolean(resource.id)
  const request = shouldUpdateExisting
    ? {
        url: `${FHIR_URL}/${resource.resourceType}/${resource.id}`,
        method: 'PUT'
      }
    : { url: `${FHIR_URL}/${resource.resourceType}`, method: 'POST' }
  const res = await fetch(request.url, {
    method: request.method,
    headers: {
      'Content-Type': 'application/fhir+json',
      Authorization: token
    },
    body: JSON.stringify(resource)
  })
  if (res.status !== 200 && res.status !== 201) {
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

export const getFromFhir = (token: string, suffix: string) => {
  return fetch(`${FHIR_URL}${suffix.startsWith('/') ? '' : '/'}${suffix}`, {
    headers: {
      'Content-Type': 'application/json+fhir',
      Authorization: token
    }
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
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

export const rollbackCreateUser = async (
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

export const rollbackUpdateUser = async (
  token: string,
  practitioner: fhir.Practitioner,
  practitionerRole: fhir.PractitionerRole
) => {
  await postFhir(token, practitioner)
  await postFhir(token, practitionerRole)
}

export async function generateUsername(
  names: IUserName[],
  existingUserName?: string
) {
  const { given = [], family = '' } =
    names.find((name) => name.use === 'en') || {}
  const initials = given.reduce(
    (accumulated, current) => accumulated + current.trim().charAt(0),
    ''
  )

  let proposedUsername = `${initials}${initials === '' ? '' : '.'}${family
    .trim()
    .replace(/ /g, '-')}`.toLowerCase()

  if (proposedUsername.length < 3) {
    proposedUsername =
      proposedUsername + '0'.repeat(3 - proposedUsername.length)
  }

  if (existingUserName && existingUserName === proposedUsername) {
    return proposedUsername
  }

  try {
    let usernameTaken = await checkUsername(proposedUsername)
    let i = 1
    const copyProposedName = proposedUsername
    while (usernameTaken) {
      if (existingUserName && existingUserName === proposedUsername) {
        return proposedUsername
      }
      proposedUsername = copyProposedName + i
      i += 1
      usernameTaken = await checkUsername(proposedUsername)
    }
  } catch (err) {
    logger.error(`Failed username generation: ${err}`)
    throw new Error('Failed username generation')
  }

  return proposedUsername
}

async function checkUsername(username: string) {
  const user = await User.findOne({ username })
  return !!user
}

export async function sendCredentialsNotification(
  userFullName: IUserName[],
  username: string,
  password: string,
  authHeader: { Authorization: string },
  msisdn?: string,
  email?: string
) {
  const url = `${NOTIFICATION_SERVICE_URL}${
    NOTIFICATION_SERVICE_URL.endsWith('/') ? '' : '/'
  }userCredentialsInvite`
  try {
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        msisdn,
        email,
        username,
        password,
        userFullName
      }),
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    })
  } catch (err) {
    logger.error(`Unable to send notification for error : ${err}`)
  }
}

export async function sendUpdateUsernameNotification(
  userFullName: IUserName[],
  username: string,
  authHeader: { Authorization: string },
  msisdn?: string,
  email?: string
) {
  const url = `${NOTIFICATION_SERVICE_URL}${
    NOTIFICATION_SERVICE_URL.endsWith('/') ? '' : '/'
  }updateUserNameSMS`
  try {
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        msisdn,
        email,
        username,
        userFullName
      }),
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    })
  } catch (err) {
    logger.error(`Unable to send notification for error : ${err}`)
  }
}
