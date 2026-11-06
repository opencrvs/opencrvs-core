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
import {
  DocumentPath,
  logger,
  parseDocumentPath,
  UUID
} from '@opencrvs/commons'
import { TrpcContext } from '@events/context'
import { userCanReadOtherUser } from '@events/router/middleware'
import {
  getUsersById,
  isTemporaryUserFile,
  isUser
} from '@events/service/users/api'

/*
 * The middleware is invoked directly, once per user, so it gets just the
 * input it reads.
 */
async function canReadOtherUser(ctx: TrpcContext, otherUserId: UUID) {
  try {
    await userCanReadOtherUser({
      ctx,
      input: otherUserId,
      next: (opts: unknown) => opts
    } as unknown as Parameters<typeof userCanReadOtherUser>[0])
    return true
  } catch {
    return false
  }
}

function isValidKey(path: DocumentPath) {
  const valid = parseDocumentPath(path) !== null || isTemporaryUserFile(path)

  if (!valid) {
    logger.warn(`Not presigning user file with an invalid key: ${path}`)
  }

  return valid
}

/**
 * The users' files the caller may read: every user's avatar, since avatars
 * are shown wherever users are listed, and the signatures of the caller and
 * of the users the caller may read. Unknown users are left out, as are paths
 * that aren't a valid storage key.
 */
export async function getReadableUserFiles(
  ctx: TrpcContext,
  userIds: UUID[]
): Promise<DocumentPath[]> {
  const users = (await getUsersById(userIds)).filter(isUser)

  const files = await Promise.all(
    users.map(async (user) => {
      const avatar = user.avatar ? [user.avatar] : []

      // No signature to check access for, so only the avatar (if any) applies
      if (!user.signature) {
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

  return files.flat().filter(isValidKey)
}
