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
import { IAuthHeader, logger, UUID } from '@opencrvs/commons'
import { USER_MANAGEMENT_URL } from '@gateway/constants'
import {
  ISystemModelData,
  IUserModelData
} from '@gateway/features/user/type-resolvers'
import decode from 'jwt-decode'
import fetch from '@gateway/fetch'
import { Scope } from '@opencrvs/commons/authentication'
import { GQLUserInput } from '@gateway/graphql/schema'

export interface ITokenPayload {
  sub: string
  exp: string
  algorithm: string
  scope: string[]
  /** The record ID that the token has access to */
  recordId?: UUID
}

export type scopeType =
  | 'register'
  | 'validate'
  | 'recordsearch'
  | 'certify'
  | 'declare'
  | 'sysadmin'
  | 'performance'

type RoleSearchPayload = {
  title?: string
  value?: MongoComparisonObject
  role?: string
  active?: boolean
  sortBy?: string
  sortOrder?: string
}

type MongoComparisonObject = {
  $eq?: string
  $gt?: string
  $lt?: string
  $gte?: string
  $lte?: string
  $in?: string[]
  $ne?: string
  $nin?: string[]
}

const SYSTEM_ROLE_TYPES = [
  'FIELD_AGENT',
  'LOCAL_REGISTRAR',
  'LOCAL_SYSTEM_ADMIN',
  'NATIONAL_REGISTRAR',
  'NATIONAL_SYSTEM_ADMIN',
  'PERFORMANCE_MANAGEMENT',
  'REGISTRATION_AGENT'
] as const

// Derive the type from SYSTEM_ROLE_TYPES
type SystemRoleType = (typeof SYSTEM_ROLE_TYPES)[number]

export const SysAdminAccessMap: Partial<
  Record<SystemRoleType, SystemRoleType[]>
> = {
  LOCAL_SYSTEM_ADMIN: [
    'FIELD_AGENT',
    'LOCAL_REGISTRAR',
    'LOCAL_SYSTEM_ADMIN',
    'PERFORMANCE_MANAGEMENT',
    'REGISTRATION_AGENT'
  ],
  NATIONAL_SYSTEM_ADMIN: [
    'FIELD_AGENT',
    'LOCAL_REGISTRAR',
    'LOCAL_SYSTEM_ADMIN',
    'NATIONAL_REGISTRAR',
    'NATIONAL_SYSTEM_ADMIN',
    'PERFORMANCE_MANAGEMENT',
    'REGISTRATION_AGENT'
  ]
}

export async function getUser(
  body: { [key: string]: string | undefined },
  authHeader: IAuthHeader
): Promise<IUserModelData> {
  const res = await fetch(`${USER_MANAGEMENT_URL}getUser`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })
  return await res.json()
}
export function canAssignRole(
  loggedInUserScope: Scope[],
  userToSave: GQLUserInput
) {
  let roleFilter: keyof typeof SysAdminAccessMap
  if (loggedInUserScope.includes('natlsysadmin')) {
    roleFilter = 'NATIONAL_SYSTEM_ADMIN'
  } else if (loggedInUserScope.includes('sysadmin')) {
    roleFilter = 'LOCAL_SYSTEM_ADMIN'
  } else {
    throw Error('Create user is only allowed for sysadmin/natlsysadmin')
  }

  return SysAdminAccessMap[roleFilter]?.includes(userToSave.systemRole)
}

export async function getSystem(
  body: { [key: string]: string | undefined },
  authHeader: IAuthHeader
): Promise<ISystemModelData> {
  const res = await fetch(`${USER_MANAGEMENT_URL}getSystem`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })
  return await res.json()
}

export async function getUserMobile(userId: string, authHeader: IAuthHeader) {
  try {
    const res = await fetch(`${USER_MANAGEMENT_URL}getUserMobile`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    })
    const body = await res.json()

    return body
  } catch (err) {
    logger.error(`Unable to retrieve mobile for error : ${err}`)
  }
}

export function hasScope(authHeader: IAuthHeader, scope: Scope) {
  if (!authHeader || !authHeader.Authorization) {
    return false
  }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  return (tokenPayload.scope && tokenPayload.scope.indexOf(scope) > -1) || false
}

export function inScope(authHeader: IAuthHeader, scopes: Scope[]) {
  const matchedScope = scopes.find((scope) => hasScope(authHeader, scope))
  return !!matchedScope
}

export function isTokenOwner(authHeader: IAuthHeader, userId: string) {
  if (!authHeader || !authHeader.Authorization) {
    return false
  }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  return (tokenPayload.sub && tokenPayload.sub === userId) || false
}

export const getTokenPayload = (token: string): ITokenPayload => {
  let decoded: ITokenPayload
  try {
    decoded = decode(token)
  } catch (err) {
    throw new Error(
      `getTokenPayload: Error occurred during token decode : ${err}`
    )
  }
  return decoded
}

export const hasRecordAccess = (authHeader: IAuthHeader, recordId: string) => {
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  return tokenPayload.recordId === recordId
}

export const getUserId = (authHeader: IAuthHeader): string => {
  if (!authHeader || !authHeader.Authorization) {
    throw new Error(`getUserId: Error occurred during token decode`)
  }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  return tokenPayload.sub
}

export function getFullName(user: IUserModelData, language: string) {
  const localName = user.name.find((name) => name.use === language)
  return `${localName?.given.join(' ') || ''} ${localName?.family || ''}`.trim()
}
