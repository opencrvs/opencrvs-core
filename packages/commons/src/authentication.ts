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
import decode from 'jwt-decode'
import { Nominal } from './nominal'
import * as z from 'zod/v4'
import { SCOPES, encodeScope, RecordScopeV2, decodeScope } from './scopes'
import { UUID } from './uuid'
export * from './scopes'

/**
 * Returns an array of accepted scopes from a JWT token, filtered by the given accepted scope types.
 *
 * @param token - The JWT token containing scope definitions.
 * @param acceptedScopes - An array of acceptable scope types to filter by.
 * @returns An array of parsed RecordScopeV2 objects that are found in the token and match the accepted scope types.
 */
export function getAcceptedScopesFromToken<T extends RecordScopeV2['type']>(
  token: string,
  acceptedScopes: T[]
): Array<Extract<RecordScopeV2, { type: T }>> {
  const tokenScopes = getScopes(token)

  return tokenScopes
    .map((scope) => {
      const parsedScope = decodeScope(scope)
      return parsedScope &&
        // Cast to string[] because Array<T>.includes requires exactly T, but
        // parsedScope.type is the full RecordScopeV2['type'] union (wider than T).
        (acceptedScopes as string[]).includes(parsedScope.type)
        ? parsedScope
        : null
    })
    .filter(
      (scope): scope is Extract<RecordScopeV2, { type: T }> => scope !== null
    )
}

export const DEFAULT_ROLES_DEFINITION = [
  {
    id: 'FIELD_AGENT',
    label: {
      defaultMessage: 'Field Agent',
      description: 'Name for user role Field Agent',
      id: 'userRole.fieldAgent'
    },
    scopes: [
      encodeScope({
        type: 'record.create',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({
        type: 'record.declare',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      })
    ]
  },
  {
    id: 'REGISTRATION_AGENT',
    label: {
      defaultMessage: 'Registration Agent',
      description: 'Name for user role Registration Agent',
      id: 'userRole.registrationAgent'
    },
    scopes: [
      encodeScope({
        type: 'record.create',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({
        type: 'record.declare',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE
    ]
  },
  {
    id: 'LOCAL_REGISTRAR',
    label: {
      defaultMessage: 'Local Registrar',
      description: 'Name for user role Local Registrar',
      id: 'userRole.localRegistrar'
    },
    scopes: [
      encodeScope({
        type: 'record.create',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({
        type: 'record.declare',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({
        type: 'record.review-duplicates',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.PROFILE_ELECTRONIC_SIGNATURE,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE
    ]
  },
  {
    id: 'LOCAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'Local System Admin',
      description: 'Name for user role Local System Admin',
      id: 'userRole.localSystemAdmin'
    },
    scopes: [
      SCOPES.USER_READ_MY_OFFICE,
      SCOPES.USER_CREATE_MY_JURISDICTION,
      SCOPES.USER_UPDATE_MY_JURISDICTION,
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS
    ]
  },
  {
    id: 'NATIONAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'National System Admin',
      description: 'Name for user role National System Admin',
      id: 'userRole.nationalSystemAdmin'
    },
    scopes: [
      SCOPES.USER_CREATE,
      SCOPES.USER_READ,
      SCOPES.USER_UPDATE,
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS
    ]
  },
  {
    id: 'PERFORMANCE_MANAGER',
    label: {
      defaultMessage: 'Performance Manager',
      description: 'Name for user role Performance Manager',
      id: 'userRole.performanceManager'
    },
    scopes: [
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS
    ]
  }
] satisfies Array<{
  id: string
  label: { defaultMessage: string; description: string; id: string }
  scopes: string[]
}>

/*
 * Describes a "legacy" user role such as FIELD_AGENT, REGISTRATION_AGENT, etc.
 * These are roles we are slowly sunsettings in favor of the new, more configurable user roles.
 */

export const TokenUserType = z.enum(['user', 'system'])
export type TokenUserType = z.infer<typeof TokenUserType>

export interface ITokenPayload {
  sub: string
  exp: string
  algorithm: string
  scope: string[]
  role?: string
  userType: TokenUserType
  eventId?: UUID
  actionId?: UUID
}

/**
 * Depending on how the API is called, there might or might not be Bearer keyword in the header.
 * To allow for usage with both direct HTTP calls and TRPC, ensure it's present to be able to use shared scope auth functions.
 */
export function setBearerForToken(token: string) {
  const bearer = 'Bearer'
  return token.startsWith(bearer) ? token : `${bearer} ${token}`
}

export function getScopes(token: string): string[] {
  const authHeader = { Authorization: setBearerForToken(token) }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])

  return tokenPayload.scope || []
}

export function hasScope(token: string, scope: string) {
  return getScopes(token).includes(scope)
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

export const getUserId = (token: TokenWithBearer): string => {
  const tokenPayload = getTokenPayload(token.split(' ')[1])
  return z.string().parse(tokenPayload.sub)
}

export const getUserTypeFromToken = (token: TokenWithBearer): TokenUserType => {
  const tokenPayload = getTokenPayload(token.split(' ')[1])

  return TokenUserType.parse(tokenPayload.userType)
}

export const TokenWithBearer = z
  .string()
  .regex(/^Bearer\s/) as z.ZodType<`Bearer ${string}`>
export type TokenWithBearer = z.infer<typeof TokenWithBearer>
export type Token = Nominal<string, 'TokenWithoutBearer'>
