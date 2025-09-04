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

import { sql } from 'kysely'
import z from 'zod'
import { ActionStatus, Draft, TokenUserType, UUID } from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import {
  EventActionDrafts,
  NewEventActionDrafts
} from './schema/app/EventActionDrafts'
import ActionType from './schema/app/ActionType'

function toDraftDocument(draft: EventActionDrafts): Draft {
  return Draft.parse({
    id: draft.id,
    transactionId: draft.transactionId,
    createdAt: draft.createdAt,
    eventId: draft.eventId,
    action: {
      transactionId: draft.transactionId,
      createdAt: draft.createdAt,
      createdBy: draft.createdBy,
      createdByRole: draft.createdByRole,
      createdByUserType: draft.createdByUserType as TokenUserType,
      createdAtLocation: draft.createdAtLocation,
      declaration: draft.declaration,
      annotation: draft.annotation,
      type: draft.actionType,
      status: ActionStatus.Accepted
    }
  })
}

export async function createDraft(draft: NewEventActionDrafts) {
  const db = getClient()
  const result = await db
    .insertInto('eventActionDrafts')
    .values(draft)
    .onConflict((oc) =>
      oc.columns(['eventId', 'createdBy']).doUpdateSet({
        declaration: sql`EXCLUDED.declaration`,
        annotation: sql`EXCLUDED.annotation`,
        createdAt: sql`NOW()`
      })
    )
    .returning([
      'id',
      'eventId',
      'transactionId',
      'declaration',
      'annotation',
      'createdAt'
    ])
    .executeTakeFirst()

  return result
}

export async function getDraftsByUserId(createdBy: string) {
  const db = getClient()
  const drafts = await db
    .selectFrom('eventActionDrafts')
    .where('createdBy', '=', createdBy)
    .orderBy('createdAt', 'asc')
    .selectAll()
    .execute()
  const draftDocuments = drafts.map(toDraftDocument)

  return z.array(Draft).parse(draftDocuments satisfies Draft[])
}

export async function findLatestDraftForAction(
  eventId: UUID,
  createdBy: string,
  actionType: ActionType
) {
  const db = getClient()
  const draft = await db
    .selectFrom('eventActionDrafts')
    .where('eventId', '=', eventId)
    .where('createdBy', '=', createdBy)
    .where('actionType', '=', actionType)
    .orderBy('createdAt', 'desc')
    .selectAll()
    .executeTakeFirst()

  if (draft) {
    const draftDocument = toDraftDocument(draft)
    return Draft.parse(draftDocument satisfies Draft)
  }

  return undefined
}

export async function deleteDraftsByEventId(eventId: UUID) {
  const db = getClient()
  return db
    .deleteFrom('eventActionDrafts')
    .where('eventId', '=', eventId)
    .execute()
}
