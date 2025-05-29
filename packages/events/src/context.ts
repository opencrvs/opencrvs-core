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
  getUser,
  getUserId,
  getUserTypeFromToken,
  logger,
  TokenUserType,
  TokenWithBearer
} from '@opencrvs/commons'
import { env } from './environment'

const UserContext = z.object({
  id: z.string(),
  primaryOfficeId: z.string(),
  role: z.string(),
  signature: z.string().nullish()
})

export function normalizeHeaders(
  headers: Headers | Record<string, string | string[] | undefined>
): Record<string, string | string[] | undefined> {
  return headers instanceof Headers
    ? Object.fromEntries(headers.entries())
    : headers
}

export async function createContext({ req }: { req: IncomingMessage }) {
  const normalizedHeaders = normalizeHeaders(req.headers)

  const token = TokenWithBearer.parse(normalizedHeaders.authorization)
  let userId: string | undefined
  let userType: TokenUserType

  // Parsing the token does not prove it has valid contents.
  try {
    userId = getUserId(token)
    userType = getUserTypeFromToken(token)
  } catch {
    logger.error('Error while parsing token')

    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  // @todo: could we use capital casing as for other types?
  if (userType === TokenUserType.enum.system) {
    return {
      userType,
      system: { id: userId },
      token
    }
  }

  try {
    const user = await getUser(env.USER_MANAGEMENT_URL, userId, token)

    // We should not trust external services to return the user in the expected format.
    const { primaryOfficeId, role, signature } = UserContext.parse(user)

    return {
      userType,
      user: { id: userId, primaryOfficeId, role, signature },
      token
    }
  } catch (error) {
    logger.error(
      `Error retrieving user details for userId ${userId}: ${JSON.stringify(error)}`
    )

    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
  }
}
