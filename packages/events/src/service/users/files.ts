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
import { DocumentPath, logger, User, UUID } from '@opencrvs/commons'
import { TrpcContext } from '@events/context'
import { assertCanReadOtherUser } from '@events/router/middleware'
import { isSignableKey } from '@events/service/files/authorize'
import { getUsersById, isOwnUserFile, isUser } from '@events/service/users/api'

async function canReadOtherUser(ctx: TrpcContext, user: User) {
  try {
    await assertCanReadOtherUser(ctx, UUID.parse(user.id), user)
    return true
  } catch {
    return false
  }
}

function isOwnFile(
  path: DocumentPath,
  userId: UUID,
  options?: { allowTemporary?: boolean }
) {
  const own = isOwnUserFile(path, userId, options)

  if (!own) {
    logger.warn(`Not presigning ${path}: not a file of user ${userId}`)
  }

  return own
}

/**
 * The users' files the caller may read: every user's avatar, since avatars
 * are shown wherever users are listed, and the signatures of the caller and
 * of the users the caller may read. Unknown users are left out, as are paths
 * that aren't the user's own file or aren't a valid storage key. With `avatarsOnly`, signatures are left
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
      const userId = UUID.parse(user.id)
      const avatar =
        user.avatar && isOwnFile(user.avatar, userId) ? [user.avatar] : []

      // No signature to check access for, so only the avatar (if any) applies
      if (
        avatarsOnly ||
        !user.signature ||
        !isOwnFile(user.signature, userId, { allowTemporary: true })
      ) {
        return avatar
      }

      if (!(await canReadOtherUser(ctx, user))) {
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
