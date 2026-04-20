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
import { getLegacyUser } from './service/users/api'
import { getLocationById } from './service/locations/locations'
import { env } from './environment'

export const TrpcContext = z.object({
  token: TokenWithBearer,
  user: z.union([SystemContext, UserContext])
})
export type TrpcContext = z.infer<typeof TrpcContext>

export const InternalTrpcContext = z.object({
  token: TokenWithBearer
})
export type InternalTrpcContext = z.infer<typeof InternalTrpcContext>
/**
 * Internal user, used to bootstrap the system and then deactivate.
 */
const SEEDER_SUPER_ADMIN = 'o.admin'

/**
 * Super admin does not have a primary office. It is the one setting locations.
 * It should be used only once to bootstrap the system. Usage should be limited. Seeing it as 'system' is one way of doing that. (And it also plays well with types)
 */
const SuperAdminContext = SystemContext.extend({
  role: z.literal('SUPER_ADMIN')
})
type SuperAdminContext = z.infer<typeof SuperAdminContext>

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

export function verifyInternalServiceToken(token: TokenWithBearer) {
  const jwtToken = token.split(' ')[1]

  return jwt.verify(jwtToken, tokenPublicKey, {
    subject: 'opencrvs:auth-service',
    algorithms: ['RS256'],
    issuer: 'opencrvs:auth-service',
    audience: ['opencrvs:events-user']
  })
}

export type TrpcUserContext = SystemContext | UserContext | SuperAdminContext

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

    const { primaryOfficeId, role, signature, username } = await getLegacyUser(
      userId,
      token
    )

    if (username === SEEDER_SUPER_ADMIN) {
      logger.warn(
        `User ${username} is used for seeding. Treating it as a ${TokenUserType.enum.system} user type.`
      )

      return SuperAdminContext.parse({
        type: TokenUserType.enum.system,
        id: userId,
        primaryOfficeId: undefined,
        role
      })
    }

    // @TODO: We should get this from a single source. Waiting for user migration.
    const location = await getLocationById(primaryOfficeId)
    return UserContext.parse({
      type: userType,
      id: userId,
      primaryOfficeId,
      administrativeAreaId: location.administrativeAreaId,
      signature,
      role
    })
  } catch (error) {
    logger.error(
      `Error retrieving user details for ${userType} ${userId}: ${JSON.stringify(error)}`
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
