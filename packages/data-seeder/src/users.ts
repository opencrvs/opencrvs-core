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
import fetch from 'node-fetch'
import { env } from './environment'
import { z } from 'zod'
import { parseGQLResponse, raise, delay } from './utils'
import { print } from 'graphql'
import gql from 'graphql-tag'
import { joinURL } from '@opencrvs/commons'
import { parseScope } from '@opencrvs/commons/authentication'
import { fromZodError } from 'zod-validation-error'

const MAX_RETRY = 5
const RETRY_DELAY_IN_MILLISECONDS = 5000

const RoleSchema = z.array(
  z.object({
    id: z.string(),
    label: z.object({
      defaultMessage: z.string(),
      description: z.string(),
      id: z.string()
    }),
    scopes: z.array(
      z.string().refine(
        (scope) => Boolean(parseScope(scope)),
        (invalidScope) => ({
          message: `invalid scope "${invalidScope}" found\n`
        })
      )
    )
  })
)

const WithoutContact = z.object({
  primaryOfficeId: z.string(),
  givenNames: z.string(),
  familyName: z.string(),
  role: z.string(),
  username: z.string(),
  password: z.string()
})

const UserSchema = z.array(
  WithoutContact.extend({
    mobile: z.string(),
    email: z.string().email().optional()
  }).or(
    WithoutContact.extend({
      email: z.string().email(),
      mobile: z.string().optional()
    })
  )
)

const searchUserQuery = print(gql`
  query searchUsers($username: String) {
    searchUsers(username: $username) {
      totalItems
    }
  }
`)

const createUserMutation = print(gql`
  mutation createOrUpdateUser($user: UserInput!) {
    createOrUpdateUser(user: $user) {
      username
    }
  }
`)

async function getUsers(token: string) {
  const url = new URL('users', env.COUNTRY_CONFIG_HOST).toString()
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  if (!res.ok) {
    raise(`Expected to get the users from ${url}`)
  }

  const parsedUsers = UserSchema.safeParse(await res.json())

  if (!parsedUsers.success) {
    raise(
      fromZodError(parsedUsers.error, {
        prefix: `Error validating users metadata returned from ${url}`
      })
    )
  }

  const userRoles = parsedUsers.data.map((user) => user.role)

  const rolesUrl = joinURL(env.COUNTRY_CONFIG_HOST, 'roles')

  const rolesResponse = await fetch(rolesUrl)

  if (!rolesResponse.ok) raise(`Error fetching roles: ${rolesResponse.status}`)

  const parsedRoles = RoleSchema.safeParse(await rolesResponse.json())

  if (!parsedRoles.success) {
    raise(
      fromZodError(parsedRoles.error, {
        prefix: `Validation failed for roles returned from ${rolesUrl}`
      }).message
    )
  }

  const allRoles = parsedRoles.data

  let isConfigUpdateAllScopeAvailable = false
  const configScope = 'config.update:all' as const

  for (const userRole of userRoles) {
    const currRole = allRoles.find((role) => role.id === userRole)
    if (!currRole)
      raise(`Role with id ${userRole} is not found in roles.ts file`)
    if (currRole.scopes.includes(configScope))
      isConfigUpdateAllScopeAvailable = true
  }

  if (!isConfigUpdateAllScopeAvailable) {
    raise(`At least one user with ${configScope} scope must be created`)
  }
  return parsedUsers.data
}

async function userAlreadyExists(
  token: string,
  username: string
): Promise<boolean> {
  const searchResponse = await fetch(`${env.GATEWAY_HOST}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: searchUserQuery,
      variables: {
        username
      }
    })
  })
  const parsedSearchResponse = parseGQLResponse<{
    searchUsers: { totalItems?: number }
  }>(await searchResponse.json())
  return Boolean(parsedSearchResponse.searchUsers.totalItems)
}

async function getOfficeIdFromIdentifier(identifier: string) {
  const response = await fetch(
    `${env.GATEWAY_HOST}/location?identifier=${identifier}`,
    {
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    }
  )
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error(
      `Error fetching location with identifier ${identifier}`,
      response.statusText
    )
    throw new Error('Error fetching location')
  }
  const locationBundle: fhir3.Bundle<fhir3.Location> = await response.json()

  return locationBundle.entry?.[0]?.resource?.id
}

async function callCreateUserMutation(token: string, userPayload: unknown) {
  return fetch(`${env.GATEWAY_HOST}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: createUserMutation,
      variables: {
        user: userPayload
      }
    })
  })
}

export async function seedUsers(token: string) {
  const rawUsers = await getUsers(token)

  for (const userMetadata of rawUsers) {
    const {
      givenNames,
      familyName,
      primaryOfficeId: officeIdentifier,
      username,
      ...user
    } = userMetadata

    if (await userAlreadyExists(token, username)) {
      // eslint-disable-next-line no-console
      console.log(
        `User with the username "${username}" already exists. Skipping user "${username}"`
      )
      continue
    }

    const primaryOffice = await getOfficeIdFromIdentifier(officeIdentifier)
    if (!primaryOffice) {
      // eslint-disable-next-line no-console
      console.log(
        `No office found with id ${officeIdentifier}. Skipping user "${username}"`
      )
      continue
    }

    const userPayload = {
      ...user,
      name: [
        {
          use: 'en',
          familyName,
          firstNames: givenNames
        }
      ],
      ...(env.ACTIVATE_USERS && { status: 'active' }),
      primaryOffice,
      username
    }
    let tryNumber = 0
    let jsonRes
    let res

    do {
      ++tryNumber
      if (tryNumber > 1) {
        await delay(RETRY_DELAY_IN_MILLISECONDS)
        // eslint-disable-next-line no-console
        console.log('Trying again for time: ', tryNumber)
      }
      res = await callCreateUserMutation(token, userPayload)
      jsonRes = await res.json()
    } while (
      tryNumber < MAX_RETRY &&
      'errors' in jsonRes &&
      jsonRes.errors[0].extensions?.code === 'INTERNAL_SERVER_ERROR'
    )

    parseGQLResponse(jsonRes)
  }
}
