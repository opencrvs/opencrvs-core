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
import { TRPCError } from '@trpc/server'
import {
  getSystem,
  getUser,
  getUserId,
  getUserTypeFromToken,
  TokenUserType
} from '@opencrvs/commons'
import { env } from './environment'

export type UserDetails =
  | {
      type: TokenUserType.USER
      id: string
      primaryOfficeId: string
      role: string
    }
  | {
      type: TokenUserType.SYSTEM
      id: string
      primaryOfficeId: undefined
      role: string
    }

export async function resolveUserDetails(
  token: `Bearer ${string}`
): Promise<UserDetails> {
  const sub = getUserId(token)

  if (!sub) {
    throw new TRPCError({
      code: 'UNAUTHORIZED'
    })
  }

  const userType = getUserTypeFromToken(token)

  if (userType === TokenUserType.SYSTEM) {
    const { type } = await getSystem(env.USER_MANAGEMENT_URL, sub, token)

    return {
      type: TokenUserType.SYSTEM,
      id: sub,
      primaryOfficeId: undefined,
      role: type
    }
  }

  const { primaryOfficeId, role } = await getUser(
    env.USER_MANAGEMENT_URL,
    sub,
    token
  )

  return {
    type: TokenUserType.USER,
    id: sub,
    primaryOfficeId,
    role
  }
}
