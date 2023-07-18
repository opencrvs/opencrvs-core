/* eslint-disable prettier/prettier */
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
// import { seedCertificate } from './certificateSeeding'

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

  const users: IUser[] = []

  for (const i in rawUsers) {
    const { givenNames, familyName, role, type, ...user } = rawUsers[i]
    users.push({
      ...user,
      role: roleToId[type],
      systemRole: role,
      name: [
        {
          use: user.username,
          family: familyName,
          given: [givenNames]
        }
      ],
      identifiers: [],
      passwordHash: 'dfgdfgdfgdfgdfgdfg',
      salt: 'sadfgte4wrtdg',
      practitionerId: 'asddsger4',
      catchmentAreaIds: [],
      scope: [],
      signature: {
        type: 'sadsa',
        data: 'asdasd'
      },
      status: 'sadasd',
      securityQuestionAnswers: [],
      creationDate: 654051
    })
  }

  console.log(users)

  const url = new URL('createUser', USER_MANAGEMENT_URL).toString()

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(users[0]),
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    }
  })

  console.log(await res.json())
}

export async function seedData() {
  const token = await getToken()
  const systemRoles = await createSystemRoles(token)
  const countryRoles = await getCountryRoles()
  const usedSystemRoles = Object.keys(
    countryRoles
  ) as typeof SYSTEM_ROLES[number][]

  const res = await updateRoles(
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
  console.log(res)
  seedUsers(token)

  // seedCertificate(token)
}
