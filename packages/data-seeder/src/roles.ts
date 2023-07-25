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
import { COUNTRY_CONFIG_URL, USER_MANAGEMENT_URL } from './constants'
import { raise } from './utils'
import fetch from 'node-fetch'
import { z } from 'zod'

export const RoleSchema = z.array(
  z.object({
    systemRole: z.enum([
      'FIELD_AGENT',
      'REGISTRATION_AGENT',
      'LOCAL_REGISTRAR',
      'LOCAL_SYSTEM_ADMIN',
      'NATIONAL_SYSTEM_ADMIN',
      'PERFORMANCE_MANAGEMENT',
      'NATIONAL_REGISTRAR'
    ]),
    label_en: z.string(),
    label_fr: z.string()
  })
)

const SYSTEM_ROLES = [
  'FIELD_AGENT',
  'LOCAL_REGISTRAR',
  'LOCAL_SYSTEM_ADMIN',
  'NATIONAL_REGISTRAR',
  'NATIONAL_SYSTEM_ADMIN',
  'PERFORMANCE_MANAGEMENT',
  'REGISTRATION_AGENT'
] as const

export interface Label {
  lang: string
  label: string
}
export interface Role {
  _id?: string
  labels: Array<Label>
}
type SystemRole = {
  _id: string
  value: typeof SYSTEM_ROLES[number]
  roles: Role[]
  active: boolean
}

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

interface GQLSystemRoleInput {
  id: string
  value?: string
  active?: boolean
  roles?: Array<Role>
}

async function updateRoles(
  token: string,
  systemRoles: GQLSystemRoleInput[]
): Promise<RoleIdMap> {
  let roleIdMap: RoleIdMap = {}
  const url = new URL('updateRole', USER_MANAGEMENT_URL).toString()
  await Promise.all(
    systemRoles.map((systemRole) =>
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(systemRole),
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      }).then(async (res) => {
        const { updRoleId } = await res.json()
        roleIdMap = { ...roleIdMap, ...updRoleId }
      })
    )
  )
  return roleIdMap
}

async function getCountryRoles() {
  const url = new URL('roles', COUNTRY_CONFIG_URL).toString()
  const res = await fetch(url)
  if (!res.ok) {
    raise(`Expected to get the roles from ${url}`)
  }
  const rawRoles = await res.json()
  console.log(rawRoles)
  const parsedRoles = RoleSchema.safeParse(rawRoles)
  if (!parsedRoles.success) {
    raise(
      `Error when getting roles from country-config: ${JSON.stringify(
        parsedRoles.error.issues
      )}`
    )
  }
  return parsedRoles.data
}

interface RoleIdMap {
  [role: string]: string
}

export async function seedRoles(token: string) {
  const systemRoles = await createSystemRoles(token)
  const countryRoles = await getCountryRoles()
  const usedSystemRoles = Object.keys(
    countryRoles
  ) as typeof SYSTEM_ROLES[number][]
  return updateRoles(
    token,
    systemRoles
      .filter(({ value }) => usedSystemRoles.includes(value))
      .map(({ _id, value, active }) => ({
        id: _id,
        value,
        active,
        roles: countryRoles[value]!
      }))
  )
}
