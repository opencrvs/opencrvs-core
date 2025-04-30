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
import { fetchLocation, fetchLocationHierarchy } from '@gateway/location'
import { resourceIdentifierToUUID } from '@opencrvs/commons/types'

export interface ITokenPayload {
  sub: string
  exp: string
  algorithm: string
  scope: Scope[]
  /** The record ID that the token has access to */
  recordId?: UUID
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

export function scopesInclude(
  scopes:
    | Scope[]
    | undefined /* @todo remove undefined variant and make scope a required field for users */,
  scope: Scope
) {
  if (!scopes) {
    return false
  }
  return scopes.includes(scope)
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

export function getUserFromHeader(header: IAuthHeader) {
  const userId = getUserId(header)
  return getUser({ userId }, header)
}

export function getFullName(user: IUserModelData, language: string) {
  const localName = user.name.find((name) => name.use === language)
  return `${localName?.given.join(' ') || ''} ${localName?.family || ''}`.trim()
}

export async function isOfficeUnderJurisdiction(
  officeId: UUID,
  otherOfficeId: UUID
) {
  const officeLocation = await fetchLocation(officeId)
  const parentLocationId =
    officeLocation.partOf &&
    resourceIdentifierToUUID(officeLocation.partOf.reference)
  if (!parentLocationId) {
    return false
  }
  const otherOfficeHierarchy = await fetchLocationHierarchy(otherOfficeId)
  return otherOfficeHierarchy.map(({ id }) => id).includes(parentLocationId)
}
