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
  ACTION_SCOPE_MAP,
  Draft,
  DraftInput,
  EventDocument,
  EventStatus,
  getStatusFromActions,
  UUID
} from '@opencrvs/commons'
import { UserContext } from '@opencrvs/commons'
import * as draftsRepo from '@events/storage/postgres/events/drafts'

/**
 * Scopes that allow saving a draft: those of the draft's action. `undefined` for input that is not a draft.
 */
export function getDraftScopes(rawInput: unknown) {
  const draft = DraftInput.pick({ type: true }).safeParse(rawInput)
  return draft.success ? ACTION_SCOPE_MAP[draft.data.type] : undefined
}

/**
 * Drafts are only saved on a new record. A draft can name a file that no action references,
 * and such a file is swept when the record is deleted, which is possible only until it is
 * notified or declared. A rejected record is notified or declared, and is updated with the
 * Edit flow, which saves no drafts.
 */
export function throwConflictIfDraftNotAllowed(event: EventDocument) {
  const status = getStatusFromActions(event.actions)

  if (status !== EventStatus.enum.CREATED) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: `Drafts can only be saved on a record that has not been notified or declared yet. The record is ${status}.`
    })
  }
}

export const createDraft = async (
  input: DraftInput,
  {
    eventId,
    user,
    transactionId
  }: {
    eventId: UUID
    user: UserContext
    transactionId: string
  }
): Promise<Draft> => {
  const draft = await draftsRepo.createDraft({
    eventId,
    transactionId,
    actionType: input.type,
    declaration: input.declaration,
    annotation: input.annotation,
    createdBy: user.id,
    createdByRole: user.role,
    createdByUserType: user.type,
    createdAtLocation: user.primaryOfficeId,
    createdBySignature: user.signature
  })

  if (!draft) {
    throw new Error('Failed to create draft')
  }

  return {
    id: draft.id,
    transactionId: draft.transactionId,
    createdAt: draft.createdAt,
    eventId: draft.eventId,
    action: {
      transactionId: draft.transactionId,
      createdAt: draft.createdAt,
      createdBy: user.id,
      createdByRole: user.role,
      createdByUserType: user.type,
      declaration: draft.declaration,
      annotation: draft.annotation,
      type: input.type,
      status: 'Accepted'
    }
  }
}

export const getDraftsByUserId = draftsRepo.getDraftsByUserId
