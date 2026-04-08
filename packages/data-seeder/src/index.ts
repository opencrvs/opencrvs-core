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
import { raise } from './utils'
import { createClient } from '@opencrvs/toolkit/api'

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

async function triggerSystemReady(token: string) {
  // eslint-disable-next-line no-console
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

    // 501, 404, and 2xx responses are acceptable
    if (
      res.status === 501 ||
      res.status === 404 ||
      (res.status >= 200 && res.status < 300)
    ) {
      // eslint-disable-next-line no-console
      console.log(
        `System ready trigger responded with acceptable status: ${res.status} ${res.statusText}`
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
  const url = new URL('events', env.GATEWAY_HOST).toString()
  const client = createClient(url, `Bearer ${token}`)
  await client.user.deactivateSuperUser.mutate({ username: 'o.admin' })
}

async function main() {
  const token = await getToken()

  // eslint-disable-next-line no-console
  console.log('Seeding locations')
  await seedLocations(token)

  // eslint-disable-next-line no-console
  console.log('Seeding users')
  await seedUsers(token)

  await triggerSystemReady(token)
  await deactivateSuperuser(token)
}

main()
