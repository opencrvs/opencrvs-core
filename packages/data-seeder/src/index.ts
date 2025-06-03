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
import { env } from './environment'
import fetch from 'node-fetch'
import { seedLocations, seedLocationsForV2Events } from './locations'
import { seedUsers } from './users'
import { parseGQLResponse, raise } from './utils'
import { print } from 'graphql'
import gql from 'graphql-tag'
import decode from 'jwt-decode'

async function getToken(): Promise<string> {
  const authUrl = new URL('authenticate-super-user', env.AUTH_HOST).toString()
  const res = await fetch(authUrl, {
    method: 'POST',
    body: JSON.stringify({
      username: 'o.admin',
      password: env.SUPER_USER_PASSWORD
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!res.ok) {
    raise(
      'Could not login as the super user. This might because you have seeded the database already and the account has now been deactivated',
      res.status,
      res.statusText
    )
  }
  const body = await res.json()
  return body.token
}

const deactivateUserMutation = print(gql`
  mutation deactivateUser(
    $userId: String!
    $action: String!
    $reason: String!
    $comment: String
  ) {
    auditUser(
      userId: $userId
      action: $action
      reason: $reason
      comment: $comment
    )
  }
`)

interface TokenPayload {
  sub: string
  exp: string
  algorithm: string
  scope: string[]
}

function getTokenPayload(token: string): TokenPayload {
  try {
    return decode<TokenPayload>(token)
  } catch (err) {
    raise(`getTokenPayload: Error occurred during token decode : ${err}`)
  }
}

async function deactivateSuperuser(token: string) {
  const { sub } = getTokenPayload(token)
  const res = await fetch(`${env.GATEWAY_HOST}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: deactivateUserMutation,
      variables: {
        userId: sub,
        action: 'DEACTIVATE',
        reason: 'Remove super user'
      }
    })
  })

  parseGQLResponse(await res.json())
}

async function main() {
  const token = await getToken()

  // eslint-disable-next-line no-console
  console.log('Seeding locations for v1 system')
  await seedLocations(token)

  // eslint-disable-next-line no-console
  console.log('Seeding locations for v2 system (events)')
  await seedLocationsForV2Events(token)

  // eslint-disable-next-line no-console
  console.log('Seeding users')
  await seedUsers(token)
  await deactivateSuperuser(token)
}

main()
