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
import { z } from 'zod'
import '@opencrvs/commons/monitoring'
import { TRPCError } from '@trpc/server'
import {
  getUserId,
  getUserTypeFromToken,
  logger,
  REINDEX_USER_ID,
  SystemRole,
  TokenUserType,
  TokenWithBearer,
  UUID
} from '@opencrvs/commons'
import { getSystem, getUser } from './service/users/api'

export const UserContext = z.object({
  id: z.string(),
  primaryOfficeId: UUID,
  role: z.string(),
  signature: z
    .string()
    .nullish()
    .describe('Storage key for the user signature. e.g. /ocrvs/signature.png'),
  type: TokenUserType.extract(['user'])
})
export type UserContext = z.infer<typeof UserContext>

export const SystemContext = z.object({
  id: z.string(),
  role: SystemRole,
  type: TokenUserType.extract(['system']),
  primaryOfficeId: z.undefined().optional(),
  signature: z.undefined().optional()
})
type SystemContext = z.infer<typeof SystemContext>

export const TrpcContext = z.object({
  token: TokenWithBearer,
  user: z.union([SystemContext, UserContext])
})

export type TrpcContext = z.infer<typeof TrpcContext>

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
  let userId: string | undefined
  let userType: TokenUserType

  try {
    userId = getUserId(token)
    userType = getUserTypeFromToken(token)
  } catch {
    logger.error('Error while parsing token')

    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  try {
    if (userId === REINDEX_USER_ID) {
      return SystemContext.parse({
        type: TokenUserType.Enum.system,
        id: userId,
        primaryOfficeId: undefined,
        role: SystemRole.enum.REINDEX
      })
    }

    if (userType === TokenUserType.Enum.system) {
      const { type } = await getSystem(userId, token)

      return SystemContext.parse({
        type: userType,
        id: userId,
        primaryOfficeId: undefined,
        role: type
      })
    }

    const { primaryOfficeId, role, signature, username } = await getUser(
      userId,
      token
    )

    if (username === SEEDER_SUPER_ADMIN) {
      logger.warn(
        `User ${username} is used for seeding. Treating it as a ${TokenUserType.Enum.system} user type.`
      )

      return SuperAdminContext.parse({
        type: TokenUserType.Enum.system,
        id: userId,
        primaryOfficeId: undefined,
        role
      })
    }

    return UserContext.parse({
      type: userType,
      id: userId,
      primaryOfficeId,
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
  let token: TokenWithBearer

  try {
    token = TokenWithBearer.parse(normalizedHeaders.authorization)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authorization token is missing'
    })
  }

  const user = await resolveUserDetails(token)
  return { token, user }
}
