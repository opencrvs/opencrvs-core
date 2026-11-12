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
  canAccessOtherUserWithScopes,
  getAcceptedScopesFromToken,
  User,
  UUID
} from '@opencrvs/commons'
import { TrpcContext } from '@events/context'
import { getLocationHierarchy } from '@events/service/locations/locations'
import { getUser } from '@events/service/users/api'

/**
 * Throws unless the caller may read the user: their own user, or one within
 * reach of their user.read scope. Pass `loadedUser` when the user is already
 * loaded, so it isn't loaded again.
 */
export async function assertCanReadOtherUser(
  ctx: TrpcContext,
  userId: UUID,
  loadedUser?: Pick<User, 'role' | 'primaryOfficeId'>
) {
  const { token, user: userReading } = ctx

  const acceptedScopes = getAcceptedScopesFromToken(token, ['user.read'])

  const isRequestingOwnUser = userReading.id === userId

  if (acceptedScopes.length === 0 && !isRequestingOwnUser) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  const otherUser = loadedUser ?? (await getUser(userId))

  if (isRequestingOwnUser) {
    return
  }

  if (acceptedScopes.length === 0) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }

  if (!otherUser.primaryOfficeId) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }

  const userLocationHierarchy = await getLocationHierarchy(
    otherUser.primaryOfficeId
  )

  const hasAccess = canAccessOtherUserWithScopes({
    scopes: acceptedScopes,
    userToAccess: {
      role: otherUser.role,
      administrativeHierarchy: userLocationHierarchy,
      primaryOfficeId: otherUser.primaryOfficeId
    },
    user: userReading
  })

  if (!hasAccess) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }
}
