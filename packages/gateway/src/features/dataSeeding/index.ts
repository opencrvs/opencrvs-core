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
import { Types } from 'mongoose'
import fetch from 'node-fetch'
import { seedCertificate } from './certificateSeeding'
import { v4 as uuid } from 'uuid'
import {
  composeFhirLocation,
  generateStatisticalExtensions,
  getLocationsByIdentifier
} from '@gateway/features/restLocation/utils'
import { fetchFromHearth } from '@gateway/features/fhir/utils'
import { OPENCRVS_SPECIFICATION_URL } from '@gateway/features/fhir/constants'

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
  id: string
  name: string
  alias: string
  partOf: string
  locationType: 'ADMIN_STRUCTURE' | 'HEALTH_FACILITY' | 'CRVS_OFFICE'
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

async function getUseres() {
  const url = new URL('users', COUNTRY_CONFIG_URL).toString()
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Expected to get the users from ${url}`)
  }
  const users = await res.json()
  return users
}

let roleToId: { [role: string]: Types.ObjectId } = {}

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
      }).then(async (res) => {
        const { msg, updRoleId } = await res.json()
        roleToId = { ...roleToId, ...updRoleId }
        return msg
      })
    )
  )
}
export interface IUserName {
  use: string
  family: string
  given: string[]
}

interface IIdentifier {
  system: string
  value: string
}
export interface ISecurityQuestionAnswer {
  questionKey: string
  answerHash: string
}
interface ISignature {
  type: string
  data: string
}
export interface IAuditHistory {
  auditedBy: string
  auditedOn: number
  action: string
  reason: string
  comment?: string
}
export interface IUser {
  name: IUserName[]
  username: string
  identifiers: IIdentifier[]
  email: string
  mobile?: string
  passwordHash: string
  salt: string
  systemRole: string
  role: Types.ObjectId
  practitionerId: string
  primaryOfficeId: string
  catchmentAreaIds: string[]
  scope: string[]
  signature: ISignature
  status: string
  securityQuestionAnswers: ISecurityQuestionAnswer[]
  creationDate: number
}

const seedUsers = async (token: string) => {
  const rawUsers = await getUseres()

  for (const rawUser of rawUsers) {
    const { givenNames, familyName, role, primaryOfficeId, ...user } = rawUser
    const locations = await getLocationsByIdentifier(primaryOfficeId)
    const officeId = locations[0].id
    const parsedUser = {
      ...user,
      role: roleToId[role],
      name: [
        {
          use: 'en',
          family: familyName,
          given: [givenNames]
        }
      ],
      primaryOfficeId: officeId
    }
    const url = new URL('createUser', USER_MANAGEMENT_URL).toString()
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(parsedUser),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    })
  }
}

async function buildLocationBundle(
  locations: LocationResponse[]
): Promise<fhir.Bundle> {
  const locationsMap = new Map(
    locations.map((location) => [
      location.id,
      { ...location, uid: `urn:uuid:${uuid()}` }
    ])
  )
  const savedLocations = await fetchFromHearth('/Location?_count=0').then(
    (bundle: fhir.Bundle) => {
      return (
        bundle.entry
          ?.map((bundleEntry) => bundleEntry.resource as fhir.Location)
          .map((location) =>
            location.identifier
              ?.find(
                ({ system }) =>
                  system ===
                    `${OPENCRVS_SPECIFICATION_URL}id/statistical-code` ||
                  system === `${OPENCRVS_SPECIFICATION_URL}id/internal-id`
              )
              ?.value?.split('_')
              .pop()
          )
          .filter((maybeId): maybeId is string => Boolean(maybeId)) ?? []
      )
    }
  )
  const savedLocationsSet = new Set(savedLocations)
  return {
    resourceType: 'Bundle',
    type: 'document',
    entry: locations
      .filter((location) => !savedLocationsSet.has(location.id))
      .map((location) => ({
        ...location,
        // statisticalID & code are legacy properties and need to be renamed
        // to id & locationType
        statisticalID: location.id,
        code: location.locationType,
        // partOf is either Location/{statisticalID} of another location or 'Location/0'
        partOf:
          locationsMap.get(location.partOf.split('/')[1])?.uid ??
          location.partOf
      }))
      .map(
        (location): fhir.BundleEntry => ({
          fullUrl: locationsMap.get(location.id)!.uid,
          resource: {
            ...composeFhirLocation(location),
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
  const locationsBundle = await buildLocationBundle(locations)
  await fetchFromHearth('', 'POST', JSON.stringify(locationsBundle))

  seedUsers(token)
  seedCertificate(token)
}
