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
import superjson from 'superjson'
import { seedUsers } from './users'
import { raise } from './utils'
import { createTRPCClient, httpLink } from '@trpc/client'
import { InitialisationRouter } from '@opencrvs/events/src/router'

export const createInitialisationClient = (token: string) => {
  return createTRPCClient<InitialisationRouter>({
    links: [
      httpLink({
        url: new URL('events/initialisation/', env.GATEWAY_HOST).href,
        transformer: superjson,
        async headers() {
          return { authorization: `Bearer ${token}` }
        }
      })
    ]
  })
}

async function getToken(): Promise<string> {
  const authUrl = new URL(
    '/auth/authenticate-super-user',
    env.GATEWAY_HOST
  ).toString()
  const res = await fetch(authUrl, {
    method: 'POST',
    body: JSON.stringify({
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

async function deactivateSuperuser(token: string) {
  const client = createInitialisationClient(token)
  await client.complete.mutate()
}

async function main() {
  const token = await getToken()

  // eslint-disable-next-line no-console
  console.log('Seeding locations')
  await seedLocations(token)

  // eslint-disable-next-line no-console
  console.log('Seeding users')
  await seedUsers(token)

  await deactivateSuperuser(token)
}

main()
