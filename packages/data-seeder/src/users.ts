/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import fetch from 'node-fetch'
import { ACTIVATE_USERS, COUNTRY_CONFIG_HOST, GATEWAY_HOST } from './constants'
import { z } from 'zod'
import { parseGQLResponse, raise } from './utils'
import { print } from 'graphql'
import gql from 'graphql-tag'
import { inspect } from 'util'

const WithoutContact = z.object({
  primaryOfficeId: z.string(),
  givenNames: z.string(),
  familyName: z.string(),
  systemRole: z.enum([
    'FIELD_AGENT',
    'REGISTRATION_AGENT',
    'LOCAL_REGISTRAR',
    'LOCAL_SYSTEM_ADMIN',
    'NATIONAL_SYSTEM_ADMIN',
    'PERFORMANCE_MANAGEMENT',
    'NATIONAL_REGISTRAR'
  ]),
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

async function getUseres() {
  const url = new URL('users', COUNTRY_CONFIG_HOST).toString()
  const res = await fetch(url)
  if (!res.ok) {
    raise(`Expected to get the users from ${url}`)
  }
  const parsedUsers = UserSchema.safeParse(await res.json())
  if (!parsedUsers.success) {
    raise(
      `Error when getting users metadata from country-config: ${inspect(
        parsedUsers.error.issues
      )}`
    )
  }
  if (
    parsedUsers.data.every(
      ({ systemRole }) => systemRole !== 'NATIONAL_SYSTEM_ADMIN'
    )
  ) {
    raise(
      `At least one user with "NATIONAL_SYSTEM_ADMIN" systemRole must be created`
    )
  }
  return parsedUsers.data
}

async function userAlreadyExists(
  token: string,
  username: string
): Promise<boolean> {
  const searchResponse = await fetch(`${GATEWAY_HOST}/graphql`, {
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
    `${GATEWAY_HOST}/location?identifier=${identifier}`,
    {
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    }
  )
  const locationBundle: fhir3.Bundle<fhir3.Location> = await response.json()
  return locationBundle.entry?.[0]?.resource?.id
}

export async function seedUsers(
  token: string,
  roleIdMap: Record<string, string | undefined>
) {
  const rawUsers = await getUseres()
  await Promise.all(
    rawUsers.map(async (userMetadata) => {
      const {
        givenNames,
        familyName,
        role,
        primaryOfficeId: officeIdentifier,
        username,
        ...user
      } = userMetadata
      if (await userAlreadyExists(token, username)) {
        console.log(
          `User with the username "${username}" already exists. Skipping user "${username}"`
        )
        return
      }
      const primaryOffice = await getOfficeIdFromIdentifier(officeIdentifier)
      if (!primaryOffice) {
        console.log(
          `No office found with id ${officeIdentifier}. Skipping user "${username}"`
        )
        return
      }
      if (!roleIdMap[role]) {
        console.log(
          `Role "${role}" is not recognized by system. Skipping user "${username}"`
        )
        return
      }
      const userPayload = {
        ...user,
        role: roleIdMap[role],
        name: [
          {
            use: 'en',
            familyName,
            firstNames: givenNames
          }
        ],
        ...(ACTIVATE_USERS === 'true' && { status: 'active' }),
        primaryOffice,
        username
      }
      const res = await fetch(`${GATEWAY_HOST}/graphql`, {
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
      parseGQLResponse(await res.json())
    })
  )
}
