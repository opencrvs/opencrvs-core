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
import { uniq } from 'lodash'
import {
  DocumentPath,
  getFilePathsFromEvent,
  parseDocumentPath,
  TokenUserType,
  UUID
} from '@opencrvs/commons'
import { ActionDocument, EventDocument } from '@opencrvs/commons/events'
import { TrpcContext } from '@events/context'
import { canAccessEventWithScopes } from '@events/router/middleware'
import { MiddlewareOptions } from '@events/router/middleware/utils'
import { getEventById } from '@events/service/events/events'
import { getDraftsByEventIdAndUserId } from '@events/storage/postgres/events/drafts'

/**
 * The caller's own unsubmitted actions on the record. A file uploaded into a
 * draft is named only there until the action is submitted.
 */
async function getOwnDraftActions(ctx: TrpcContext, event: EventDocument) {
  if (ctx.user.type !== TokenUserType.enum.user) {
    return []
  }

  const drafts = await getDraftsByEventIdAndUserId(event.id, ctx.user.id)

  return drafts
    .map((draft) => ActionDocument.safeParse({ ...draft.action, id: draft.id }))
    .flatMap((parsed) => (parsed.success ? [parsed.data] : []))
}

/**
 * Every file the record names: field values and the signatures of the users
 * who performed its actions.
 */
function getNamedFiles(event: EventDocument): DocumentPath[] {
  const signatures = event.actions.flatMap((action) =>
    'createdBySignature' in action && action.createdBySignature
      ? [action.createdBySignature]
      : []
  )

  return [...getFilePathsFromEvent(event), ...signatures]
}

/**
 * The files a caller who may read the record may also read: those its
 * actions and the caller's own drafts name. Whoever may read a record may
 * read what it names, so the path itself is never what grants access.
 *
 * Paths that aren't a valid storage key are left out, so a malformed value
 * can't be resolved into some other key when it is signed.
 */
export async function getReadableEventFiles(
  ctx: TrpcContext,
  event: EventDocument
): Promise<DocumentPath[]> {
  const draftActions = await getOwnDraftActions(ctx, event)

  return uniq([
    ...getNamedFiles(event),
    ...getNamedFiles({ ...event, actions: draftActions })
  ]).filter((path) => parseDocumentPath(path) !== null)
}

/*
 * The middleware is invoked directly: the record to check isn't known until
 * the path has been parsed, so it gets just the field it reads.
 */
async function assertCanReadEvent(ctx: TrpcContext, eventId: UUID) {
  await canAccessEventWithScopes(['record.read'])({
    ctx,
    getRawInput: () => ({ eventId }),
    next: (opts: unknown) => opts
  } as unknown as MiddlewareOptions)
}

/**
 * Throws unless the caller may read the record and the record names the
 * file. The record is `eventId`, or the one an `events/{eventId}/` path is
 * stored under; any other path must say which record it belongs to.
 */
export async function assertCanReadEventFile(
  ctx: TrpcContext,
  { filePath, eventId }: { filePath: string; eventId?: UUID }
): Promise<DocumentPath> {
  const file = parseDocumentPath(filePath)

  if (!file) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Unrecognized file path: ${filePath}`
    })
  }

  const recordId = eventId ?? (file.kind === 'event' ? file.eventId : undefined)

  if (!recordId) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }

  await assertCanReadEvent(ctx, recordId)

  const readable = await getReadableEventFiles(
    ctx,
    await getEventById(recordId)
  )

  if (!readable.includes(file.path)) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }

  return file.path
}
