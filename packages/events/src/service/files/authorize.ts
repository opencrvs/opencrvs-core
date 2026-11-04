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
  getFilePathsFromEvent,
  ParsedDocumentPath,
  TokenUserType,
  UUID
} from '@opencrvs/commons'
import { TrpcContext } from '@events/context'
import {
  canAccessEventWithScopes,
  userCanReadOtherUser
} from '@events/router/middleware'
import { MiddlewareOptions } from '@events/router/middleware/utils'
import { getEventById } from '@events/service/events/events'
import { getUserByFilePath } from '@events/storage/postgres/events/users'

/*
 * The middlewares are invoked directly: there's no procedure input for them to
 * parse here, so they get just the fields they read.
 */
async function assertCanReadEvent(ctx: TrpcContext, eventId: UUID) {
  await canAccessEventWithScopes(['record.read'])({
    ctx,
    getRawInput: () => ({ eventId }),
    next: (opts: unknown) => opts
  } as unknown as MiddlewareOptions)
}

async function canReadOtherUser(ctx: TrpcContext, otherUserId: string) {
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

/**
 * A user's own file: any user may see an avatar, but only the owner, or
 * someone who may read that user, may see a signature.
 */
async function canReadUserFile(ctx: TrpcContext, file: ParsedDocumentPath) {
  if (ctx.user.type !== TokenUserType.enum.user) {
    return false
  }

  const owner = await getUserByFilePath(file.path)

  if (!owner) {
    return false
  }

  // Avatars are shown to every user (user.list); own files are always readable
  if (owner.profileImagePath === file.path || owner.id === ctx.user.id) {
    return true
  }

  return canReadOtherUser(ctx, owner.id)
}

/**
 * A file the record names, either as a field value or as the signature of the
 * user who performed one of its actions.
 */
async function isReferencedByEvent(eventId: UUID, file: ParsedDocumentPath) {
  const event = await getEventById(eventId)

  return (
    getFilePathsFromEvent(event).includes(file.path) ||
    event.actions.some(
      (action) =>
        'createdBySignature' in action &&
        action.createdBySignature === file.path
    )
  )
}

/**
 * Throws unless the caller may read `file`. documents-service signs whatever
 * it's given, so this is the only check on file reads.
 *
 * - `events/{eventId}/...` needs record.read on that event.
 * - Any other file must belong to a user the caller may read it from, or be
 *   referenced by the record `eventId` names, which the caller must be able
 *   to read.
 */
export async function authorizeFileRead({
  file,
  eventId,
  ctx
}: {
  file: ParsedDocumentPath
  eventId?: UUID
  ctx: TrpcContext
}): Promise<void> {
  // Record attachment: allowed if the caller can read the event in its path
  if (file.kind === 'event') {
    return assertCanReadEvent(ctx, file.eventId)
  }

  // User file: allowed if it's an avatar, the caller's own, or a user they may read
  if (await canReadUserFile(ctx, file)) {
    return
  }

  // Otherwise the caller must be able to read the named record (throws if not)
  if (eventId) {
    await assertCanReadEvent(ctx, eventId)
    // ...and that record must reference this exact file
    if (await isReferencedByEvent(eventId, file)) {
      return
    }
  }

  throw new TRPCError({ code: 'NOT_FOUND' })
}
