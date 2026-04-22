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

import { IncomingMessage } from 'http'
import { readFileSync } from 'fs'
import * as z from 'zod/v4'
import '@opencrvs/commons/monitoring'
import { TRPCError } from '@trpc/server'
import * as jwt from 'jsonwebtoken'
import {
  logger,
  REINDEX_USER_ID,
  TokenUserType,
  TokenWithBearer,
  SystemContext,
  UserContext
} from '@opencrvs/commons'
export { SystemContext, UserContext }
import { env } from './environment'
import { getUser } from './service/users/api'

export const TrpcContext = z.object({
  token: TokenWithBearer,
  user: z.union([SystemContext, UserContext])
})
export type TrpcContext = z.infer<typeof TrpcContext>

export const InternalTrpcContext = z.object({
  token: TokenWithBearer
})
export type InternalTrpcContext = z.infer<typeof InternalTrpcContext>

const tokenPublicKey = readFileSync(env.CERT_PUBLIC_KEY_PATH)

const TokenClaims = z.object({
  sub: z.string(),
  userType: TokenUserType,
  scope: z.array(z.string())
})
type TokenClaims = z.infer<typeof TokenClaims>

function verifyAppToken(token: TokenWithBearer): TokenClaims {
  const jwtToken = token.split(' ')[1]

  const verified = jwt.verify(jwtToken, tokenPublicKey, {
    algorithms: ['RS256'],
    issuer: 'opencrvs:auth-service',
    audience: ['opencrvs:gateway-user', 'opencrvs:events-user']
  })

  return TokenClaims.parse(verified)
}

type InternalServiceSubject =
  | 'opencrvs:auth-service'
  | 'opencrvs:data-seeder-service'

export function verifyInternalServiceToken(token: TokenWithBearer) {
  const tokenWithoutBearer = token.split(' ')[1]
  const subjects = [
    'opencrvs:auth-service',
    'opencrvs:data-seeder-service'
  ] satisfies InternalServiceSubject[]

  for (const subject of subjects) {
    try {
      return jwt.verify(tokenWithoutBearer, tokenPublicKey, {
        subject,
        algorithms: ['RS256'],
        issuer: 'opencrvs:auth-service',
        audience: ['opencrvs:events-user']
      })
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      continue
    }
  }

  throw new TRPCError({ code: 'UNAUTHORIZED' })
}

export type TrpcUserContext = SystemContext | UserContext

type HeadersLike =
  // gateway is not aware of Headers. We use this as a proxy.
  | {
      entries: () => IterableIterator<[string, string]>
    }
  | Headers

// This avoids TS2693 ("'Headers' only refers to a type, but is being used as a value here.") which is thrown by gateway in CI
function isHeadersLike(
  headers: HeadersLike | Record<string, string | string[] | undefined>
): headers is HeadersLike {
  return typeof headers === 'object' && typeof headers.entries === 'function'
}

function normalizeHeaders(
  headers: Headers | Record<string, string | string[] | undefined>
): Record<string, string | string[] | undefined> {
  if (isHeadersLike(headers)) {
    return Object.fromEntries(headers.entries())
  }

  return headers
}

async function resolveUserDetails(
  token: TokenWithBearer
): Promise<TrpcUserContext> {
  let userId: string
  let userType: TokenUserType

  try {
    const claims = verifyAppToken(token)
    userId = claims.sub
    userType = claims.userType
  } catch {
    logger.error('Error while parsing token')

    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  try {
    if (userId === REINDEX_USER_ID) {
      return SystemContext.parse({
        type: TokenUserType.enum.system,
        id: userId,
        primaryOfficeId: undefined
      })
    }

    if (userType === TokenUserType.enum.system) {
      return SystemContext.parse({
        type: userType,
        id: userId,
        primaryOfficeId: undefined
      })
    }

    const { primaryOfficeId, role, signature, administrativeAreaId } =
      await getUser(userId)

    return UserContext.parse({
      type: userType,
      id: userId,
      primaryOfficeId,
      administrativeAreaId,
      signature,
      role
    })
  } catch (error) {
    logger.error(
      `Error retrieving user details for ${userType} ${userId}: ${error}}`
    )

    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
  }
}

export async function createContext({ req }: { req: IncomingMessage }) {
  const normalizedHeaders = normalizeHeaders(req.headers)
  const token = TokenWithBearer.safeParse(normalizedHeaders.authorization).data

  return {
    token,
    user: token && (await resolveUserDetails(token).catch(() => undefined))
  }
}

/**
 * Context for internal service calls between services, authenticated with a service token. Does not include user details, as the token is not associated with a user.
 */
export function createInternalContext({ req }: { req: IncomingMessage }) {
  const normalizedHeaders = normalizeHeaders(req.headers)

  try {
    const token = TokenWithBearer.parse(normalizedHeaders.authorization)

    verifyInternalServiceToken(token)

    return {
      token
    }
  } catch {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
}
