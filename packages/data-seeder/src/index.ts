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
import { AUTH_URL, SUPER_USER_PASSWORD } from './constants'
import fetch from 'node-fetch'
import { seedCertificate } from './certificates'
import { seedLocations } from './locations'
import { seedRoles } from './roles'
import { seedUsers } from './users'
import { raise } from './utils'

async function getToken(): Promise<string> {
  const authUrl = new URL('authenticate-super-user', AUTH_URL).toString()
  const res = await fetch(authUrl, {
    method: 'POST',
    body: JSON.stringify({
      username: 'o.admin',
      password: SUPER_USER_PASSWORD
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!res.ok) {
    raise('Could not login as the super user')
  }
  const body = await res.json()
  return body.token
}

async function main() {
  const token = await getToken()
  const roleIdMap = await seedRoles(token)
  await seedLocations(token)
  console.log('Seeding users')
  await seedUsers(token, roleIdMap)
  console.log('Seeding certificates')
  await seedCertificate(token)
}

main()
