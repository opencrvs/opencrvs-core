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
import { COUNTRY_CONFIG_HOST, GATEWAY_HOST } from './constants'
import { raise, parseGQLResponse } from './utils'
import fetch from 'node-fetch'
import { z } from 'zod'
import { print } from 'graphql'
import gql from 'graphql-tag'
import { inspect } from 'util'

const LabelSchema = z.array(
  z.object({
    labels: z.array(z.object({ lang: z.string(), label: z.string() }))
  })
)

/*
 * at least LOCAL_REGISTRAR & NATIONAL_SYSTEM_ADMIN
 * roles are required
 */
const CountryRoleSchema = z.object({
  FIELD_AGENT: LabelSchema.optional(),
  LOCAL_REGISTRAR: LabelSchema,
  LOCAL_SYSTEM_ADMIN: LabelSchema.optional(),
  NATIONAL_REGISTRAR: LabelSchema.optional(),
  NATIONAL_SYSTEM_ADMIN: LabelSchema,
  PERFORMANCE_MANAGEMENT: LabelSchema.optional(),
  REGISTRATION_AGENT: LabelSchema.optional()
})

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

interface GQLSystemRoleInput {
  id: string
  value?: string
  active?: boolean
  roles?: Array<Role>
}

type SystemRole = {
  id: string
  value: typeof SYSTEM_ROLES[number]
  roles: Array<Role>
  active: boolean
}

const updateRoleMutation = print(gql`
  mutation updateRole($systemRole: SystemRoleInput) {
    updateRole(systemRole: $systemRole) {
      roleIdMap
    }
  }
`)

const getSystemRolesQuery = print(gql`
  query getSystemRoles {
    getSystemRoles(active: true) {
      id
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

async function fetchSystemRoles(token: string): Promise<SystemRole[]> {
  const res = await fetch(`${GATEWAY_HOST}/graphql`, {
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
  const parsedResponse = parseGQLResponse<{ getSystemRoles: SystemRole[] }>(
    await res.json()
  )
  return parsedResponse.getSystemRoles
}

async function updateRoles(
  token: string,
  systemRoles: GQLSystemRoleInput[]
): Promise<RoleIdMap> {
  let roleIdMap: RoleIdMap = {}
  await Promise.all(
    systemRoles.map((systemRole) =>
      fetch(`${GATEWAY_HOST}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          query: updateRoleMutation,
          variables: {
            systemRole
          }
        })
      }).then(async (res) => {
        const parsedResponse = parseGQLResponse<{
          updateRole: { roleIdMap: RoleIdMap }
        }>(await res.json())
        roleIdMap = {
          ...roleIdMap,
          ...parsedResponse.updateRole.roleIdMap
        }
      })
    )
  )
  return roleIdMap
}

async function fetchCountryRoles() {
  const url = new URL('roles', COUNTRY_CONFIG_HOST).toString()
  const res = await fetch(url)
  if (!res.ok) {
    raise(`Expected to get the roles from ${url}`)
  }
  const parsedRoles = CountryRoleSchema.safeParse(await res.json())
  if (!parsedRoles.success) {
    raise(
      `Error when getting roles from country-config: ${inspect(
        parsedRoles.error.issues
      )}`
    )
  }
  return parsedRoles.data
}

type RoleIdMap = Record<string, string | undefined>

export async function seedRoles(token: string) {
  const systemRoles = await fetchSystemRoles(token)
  const roleIdMap = systemRoles.reduce<RoleIdMap>(
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
  const countryRoles = await fetchCountryRoles()
  const usedSystemRoles = Object.keys(
    countryRoles
  ) as typeof SYSTEM_ROLES[number][]
  const updatedRoleIdMap = await updateRoles(
    token,
    systemRoles
      .filter(({ value }) => usedSystemRoles.includes(value))
      .filter((systemRole) => {
        if (Boolean(systemRole.roles?.length)) {
          console.log(
            `Roles for the systemRole "${systemRole.value}" already exists. Skipping`
          )
        }
        return !Boolean(systemRole.roles?.length)
      })
      .map((systemRole) => ({
        ...systemRole,
        roles: countryRoles[systemRole.value]!
      }))
  )
  return {
    ...roleIdMap,
    ...updatedRoleIdMap
  }
}
