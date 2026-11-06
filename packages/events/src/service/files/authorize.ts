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
import { uniq } from 'lodash'
import {
  DocumentPath,
  getFilePathsFromEvent,
  getFilePathsFromValues,
  logger,
  parseDocumentPath,
  TokenUserType,
  UUID
} from '@opencrvs/commons'
import { EventDocument } from '@opencrvs/commons/events'
import { TrpcContext } from '@events/context'
import { isTemporaryUserFile } from '@events/service/users/api'
import { getDraftsByEventIdAndUserId } from '@events/storage/postgres/events/drafts'

/**
 * Files named by the caller's own unsubmitted actions on the record. A file
 * uploaded into a draft is named only there until the action is submitted.
 */
async function getOwnDraftFiles(ctx: TrpcContext, eventId: UUID) {
  if (ctx.user.type !== TokenUserType.enum.user) {
    return []
  }

  const drafts = await getDraftsByEventIdAndUserId(eventId, ctx.user.id)

  return drafts.flatMap((draft) => getFilePathsFromValues(draft.action))
}

/**
 * Whether a stored path is a storage key the system writes. Anything else is
 * left out of presigning, so a malformed value can't be resolved into some
 * other key when it is signed.
 */
export function isSignableKey(path: DocumentPath) {
  const signable = parseDocumentPath(path) !== null || isTemporaryUserFile(path)

  if (!signable) {
    logger.warn(`Not presigning a file with an invalid key: ${path}`)
  }

  return signable
}

/**
 * The files a caller who may read the record may also read: those its
 * actions and the caller's own drafts name.
 */
export async function getReadableEventFiles(
  ctx: TrpcContext,
  event: EventDocument
): Promise<DocumentPath[]> {
  return uniq([
    ...getFilePathsFromEvent(event),
    ...(await getOwnDraftFiles(ctx, event.id))
  ]).filter(isSignableKey)
}
