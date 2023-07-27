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
import { AUTH_URL, GATEWAY_GQL_HOST, SUPER_USER_PASSWORD } from './constants'
import fetch from 'node-fetch'
// import { seedCertificate } from './certificates'
// import { seedLocations } from './locations'
// import { seedRoles } from './roles'
// import { seedUsers } from './users'
import { raise } from './utils'
import { print } from 'graphql'
import gql from 'graphql-tag'

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

const getSystemRolesQuery = print(gql`
  query getSystemRoles {
    getSystemRoles(active: true) {
      value
      roles {
        _id
        labels {
          label
        }
      }
    }
  }
`)

type SystemRole = {
  active: boolean
  id: string
  roles: Array<Role>
  value:
    | 'FIELD_AGENT'
    | 'LOCAL_REGISTRAR'
    | 'LOCAL_SYSTEM_ADMIN'
    | 'NATIONAL_REGISTRAR'
    | 'NATIONAL_SYSTEM_ADMIN'
    | 'PERFORMANCE_MANAGEMENT'
    | 'REGISTRATION_AGENT'
}

export type Role = {
  _id: string
  labels: Array<RoleLabel>
}

export type RoleLabel = {
  label: string
  lang: string
}

async function fetchRolesMap(
  token: string
): Promise<Record<string, string | undefined>> {
  const res = await fetch(GATEWAY_GQL_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: getSystemRolesQuery,
      variables: {
        active: true
      }
    })
  })
  if (!res.ok) {
    raise(`Failed to fetch roles from gateway`)
  }
  return res.json().then((res) =>
    (res.data.getSystemRoles as SystemRole[]).reduce(
      (systemRoleMap, systemRole) => ({
        ...systemRoleMap,
        ...systemRole.roles.reduce(
          (roleMap, role) => ({
            ...roleMap,
            ...role.labels.reduce(
              (labelMap, label) => ({
                ...labelMap,
                [label.label]: role._id
              }),
              {}
            )
          }),
          {}
        )
      }),
      {}
    )
  )
}

async function main() {
  const token = await getToken()
  // const roleIdMap = await seedRoles(token)
  // await seedLocations(token)
  // await seedUsers(token, roleIdMap)
  // await seedCertificate(token)
  console.log(JSON.stringify(await fetchRolesMap(token)))
}

main()
