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
import { seedLocations } from './locations'
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

/* eslint-disable no-console */
async function triggerSystemReady(token: string) {
  console.log('Triggering system ready')
  const systemReadyUrl = new URL(
    'triggers/system/ready',
    env.COUNTRY_CONFIG_HOST
  ).toString()

  try {
    const res = await fetch(systemReadyUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (res.status === 501) {
      console.log(
        `System ready trigger endpoint not implemented. If this is a real country implementation, consider implementing it!`
      )
      return
    }

    // 404, and 2xx responses are acceptable
    if (res.status === 404 || (res.status >= 200 && res.status < 300)) {
      console.log(
        `System ready trigger responded with expected status: ${res.status} ${res.statusText}`
      )
      return
    }

    raise(
      `System ready trigger failed with unexpected status: ${res.status}`,
      res.status,
      res.statusText
    )
  } catch (err) {
    raise(`System ready trigger failed with error: ${err}`)
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

  console.log('Seeding locations')
  await seedLocations(token)

  console.log('Seeding users')
  await seedUsers(token)

  await triggerSystemReady(token)
  await deactivateSuperuser(token)
}

main()
