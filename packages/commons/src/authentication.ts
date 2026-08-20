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
import { ScopeType, decodeScope, Scope, EncodedScope } from './scopes'
import { UUID } from './uuid'
export * from './scopes'

/**
 * Returns an array of accepted scopes from a JWT token, filtered by the given accepted scope types.
 *
 * @param token - The JWT token containing scope definitions.
 * @param acceptedScopes - An array of acceptable scope types to filter by.
 * @returns An array of parsed RecordScopeV2 objects that are found in the token and match the accepted scope types.
 */
export function getAcceptedScopesFromToken<T extends ScopeType>(
  token: string,
  acceptedScopes: T[]
): Array<Extract<Scope, { type: T }>> {
  const tokenScopes = getScopes(token)

  return tokenScopes
    .map((scope) => {
      const parsedScope = decodeScope(scope)
      return parsedScope && acceptedScopes.some((s) => s === parsedScope.type)
        ? parsedScope
        : null
    })
    .filter((scope): scope is Extract<Scope, { type: T }> => scope !== null)
}

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
  scope: EncodedScope[]
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

export function getScopes(token: string): EncodedScope[] {
  const authHeader = { Authorization: setBearerForToken(token) }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])

  return tokenPayload.scope || []
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

/**
 * Extracts the subject (user ID) from a raw JWT string (without Bearer prefix).
 * Returns null if the token cannot be decoded.
 */
export const getUserIdFromToken = (token: string): string | null => {
  try {
    const payload = decode(token) as { sub?: string }
    return payload.sub ?? null
  } catch {
    return null
  }
}

/**
 * Fixed subject (`sub`) of the service token that core's auth service mints
 * at `GET /internal/service-token`. The token carries no scopes and has
 * userType 'system'; core uses it for unattended service-to-service calls where
 * no user is involved — startup event-config load, background broadcasts and
 * telemetry. See packages/auth/src/features/serviceToken/handler.ts.
 */
export const SERVICE_USER_ID = '__SERVICE_USER__'

/**
 * True when a decoded token payload (e.g. Hapi's `request.auth.credentials`)
 * belongs to core's service token, identified by its fixed subject. A country
 * configuration uses this to accept core's own service-to-service calls (e.g.
 * telemetry, all-user broadcasts) while rejecting any logged-in user's token.
 *
 * Accepts `unknown` so loosely-typed framework credentials can be passed
 * directly without a cast; anything that is not an object with the matching
 * `sub` yields `false`.
 */
export function isServiceToken(credentials: unknown): boolean {
  return (
    typeof credentials === 'object' &&
    credentials !== null &&
    (credentials as { sub?: unknown }).sub === SERVICE_USER_ID
  )
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
