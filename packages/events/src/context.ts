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
  getSystem,
  getUser,
  getUserId,
  getUserTypeFromToken,
  logger,
  SystemRole,
  TokenUserType,
  TokenWithBearer
} from '@opencrvs/commons'
import { env } from './environment'

const UserContext = z.object({
  id: z.string(),
  primaryOfficeId: z.string(),
  role: z.string(),
  signature: z
    .string()
    .nullish()
    .describe('Storage key for the user signature. e.g. /ocrvs/signature.png'),
  type: TokenUserType.extract(['user'])
})
type UserContext = z.infer<typeof UserContext>

export const SystemContext = z.object({
  id: z.string(),
  role: SystemRole,
  type: TokenUserType.extract(['system']),
  primaryOfficeId: z.undefined().optional(),
  signature: z.undefined().optional()
})
type SystemContext = z.infer<typeof SystemContext>

export type TrpcUserContext = SystemContext | UserContext

export const TrpcContext = z.object({
  token: TokenWithBearer,
  user: z.union([SystemContext, UserContext])
})
export type TrpcContext = z.infer<typeof TrpcContext>

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

export async function resolveUserDetails(
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
    if (userType === TokenUserType.Enum.system) {
      const { type } = await getSystem(env.USER_MANAGEMENT_URL, userId, token)

      return SystemContext.parse({
        type: userType,
        id: userId,
        primaryOfficeId: undefined,
        role: type
      })
    }

    const { primaryOfficeId, role, signature } = await getUser(
      env.USER_MANAGEMENT_URL,
      userId,
      token
    )

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
  const token = TokenWithBearer.parse(normalizedHeaders.authorization)

  const user = await resolveUserDetails(token)
  return { token, user }
}
