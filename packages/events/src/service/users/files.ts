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
import { DocumentPath, logger, UUID } from '@opencrvs/commons'
import { TrpcContext } from '@events/context'
import { assertCanReadOtherUser } from '@events/router/middleware'
import { isSignableKey } from '@events/service/files/authorize'
import { getUsersById, isUser } from '@events/service/users/api'

async function canReadOtherUser(ctx: TrpcContext, userId: UUID) {
  try {
    await assertCanReadOtherUser(ctx, userId)
    return true
  } catch {
    return false
  }
}

/**
 * The users' files the caller may read: every user's avatar, since avatars
 * are shown wherever users are listed, and the signatures of the caller and
 * of the users the caller may read. Unknown users are left out, as are paths
 * that aren't a valid storage key. With `avatarsOnly`, signatures are left
 * out without checking who may read them.
 */
export async function getReadableUserFiles(
  ctx: TrpcContext,
  userIds: UUID[],
  { avatarsOnly = false }: { avatarsOnly?: boolean } = {}
): Promise<DocumentPath[]> {
  const users = (await getUsersById(userIds)).filter(isUser)

  const files = await Promise.all(
    users.map(async (user) => {
      const avatar = user.avatar ? [user.avatar] : []

      // No signature to check access for, so only the avatar (if any) applies
      if (avatarsOnly || !user.signature) {
        return avatar
      }

      if (!(await canReadOtherUser(ctx, user.id as UUID))) {
        logger.info(
          `Not presigning the signature of user ${user.id}: user ${ctx.user.id} may not read that user`
        )
        return avatar
      }

      return [...avatar, user.signature]
    })
  )

  return files.flat().filter(isSignableKey)
}
