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
  COUNTRY_CONFIG_URL,
  SUPER_USER_PASSWORD,
  USER_MANAGEMENT_URL
} from '@gateway/constants'
import {
  GQLRoleInput,
  GQLSystemRole,
  GQLSystemRoleInput
} from '@gateway/graphql/schema'
import fetch from 'node-fetch'
import { OPENCRVS_SPECIFICATION_URL } from '@gateway/features/fhir/constants'
import { seedCertificate } from './certificateSeeding'
import { v4 as uuid } from 'uuid'
import { generateStatisticalExtensions } from '@gateway/features/restLocation/utils'
import { fetchFromHearth } from '@gateway/features/fhir/utils'

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

type SystemRole = Omit<GQLSystemRole, 'id'> & {
  _id: string
  roles: GQLRoleInput[]
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

type RoleResponse = {
  [K in typeof SYSTEM_ROLES[number]]?: GQLRoleInput[]
}

type LocationResponse = {
  statisticalID: string
  name: string
  alias: string
  partOf: string
  code: 'ADMIN_STRUCTURE' | 'HEALTH_FACILITY' | 'CRVS_OFFICE'
  physicalType: 'Jurisdiction' | 'Building'
  jurisdictionType?:
    | 'STATE'
    | 'DISTRICT'
    | 'LOCATION_LEVEL_3'
    | 'LOCATION_LEVEL_3'
    | 'LOCATION_LEVEL_4'
    | 'LOCATION_LEVEL_5'
  statistics?: Array<{
    year: number
    male_population: number
    female_population: number
    population: number
    crude_birth_rate: number
  }>
}

async function getCountryRoles() {
  const url = new URL('roles', COUNTRY_CONFIG_URL).toString()
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Expected to get the roles from ${url}`)
  }
  return res.json() as Promise<RoleResponse>
}

async function getLocations() {
  const url = new URL('locations', COUNTRY_CONFIG_URL).toString()
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Expected to get the locations from ${url}`)
  }
  return res.json() as Promise<LocationResponse[]>
}

async function updateRoles(token: string, systemRoles: GQLSystemRoleInput[]) {
  const url = new URL('updateRole', USER_MANAGEMENT_URL).toString()
  return Promise.all(
    systemRoles.map((systemRole) =>
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(systemRole),
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      }).then((res) => res.json() as Promise<{ msg: string }>)
    )
  )
}

function buildLocationBundle(locations: LocationResponse[]): fhir.Bundle {
  const locationsMap = new Map(
    locations.map((location) => [
      location.statisticalID,
      { ...location, uid: `urn:uuid:${uuid()}` }
    ])
  )
  return {
    resourceType: 'Bundle',
    type: 'document',
    entry: locations.map(
      (location): fhir.BundleEntry => ({
        fullUrl: locationsMap.get(location.statisticalID)!.uid,
        resource: {
          resourceType: 'Location',
          identifier: [
            {
              system: `${OPENCRVS_SPECIFICATION_URL}id/${
                location.code === 'ADMIN_STRUCTURE'
                  ? 'statistical-code'
                  : 'internal-id'
              }`,
              value: `${location.code}_${location.statisticalID}`
            },
            ...(location.jurisdictionType
              ? [
                  {
                    system: `${OPENCRVS_SPECIFICATION_URL}id/jurisdiction-type`,
                    value: location.jurisdictionType
                  }
                ]
              : [])
          ],
          name: location.name,
          ...(location.code === 'ADMIN_STRUCTURE' && {
            description: location.statisticalID
          }),
          alias: [location.alias],
          status: 'active',
          mode: 'instance',
          partOf: {
            // partOf is either statisticalID of another location or 'Location/0'
            reference:
              locationsMap.get(location.partOf.split('/')[1])?.uid ??
              location.partOf
          },
          type: {
            coding: [
              {
                system: `${OPENCRVS_SPECIFICATION_URL}location-type`,
                code: location.code
              }
            ]
          },
          physicalType: {
            coding: [
              {
                code: location.physicalType === 'Jurisdiction' ? 'jdn' : 'bu',
                display: location.physicalType
              }
            ]
          },
          ...(location.statistics && {
            extension: generateStatisticalExtensions(location.statistics)
          })
        }
      })
    )
  }
}

export async function seedData() {
  const token = await getToken()
  const systemRoles = await createSystemRoles(token)
  const countryRoles = await getCountryRoles()
  const usedSystemRoles = Object.keys(
    countryRoles
  ) as typeof SYSTEM_ROLES[number][]
  await updateRoles(
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
  const locations = await getLocations()
  const locationsBundle = buildLocationBundle(locations)
  const res = await fetchFromHearth('', 'POST', JSON.stringify(locationsBundle))
  console.log(res)
  seedCertificate(token)
}
