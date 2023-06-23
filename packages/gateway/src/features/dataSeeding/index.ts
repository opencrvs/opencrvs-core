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
import {
  AUTH_URL,
  SUPER_USER_PASSWORD,
  USER_MANAGEMENT_URL
} from '@gateway/constants'
import { GQLSystemRole } from '@gateway/graphql/schema'
import fetch from 'node-fetch'

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
  const body = await res.json()
  if (!res.ok) {
    throw Error(
      `authenticating super user failed with error ${JSON.stringify(body)}`
    )
  }
  return body.token
}

const SYSTEM_ROLES = [
  'FIELD_AGENT',
  'LOCAL_REGISTRAR',
  'LOCAL_SYSTEM_ADMIN',
  'NATIONAL_REGISTRAR',
  'NATIONAL_SYSTEM_ADMIN',
  'PERFORMANCE_MANAGEMENT',
  'REGISTRATION_AGENT'
] as const

type SystemRole = Exclude<GQLSystemRole, 'id'> & { _id: string }

async function createSystemRoles(token: string): Promise<SystemRole[]> {
  const url = new URL('systemRole', USER_MANAGEMENT_URL).toString()
  return Promise.all(
    SYSTEM_ROLES.map((systemRole) =>
      fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          value: systemRole,
          roles: []
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      }).then((res) => res.json())
    )
  )
}

export async function seedData() {
  const token = await getToken()
  const systemRoles = await createSystemRoles(token)
  console.log(systemRoles)
}
