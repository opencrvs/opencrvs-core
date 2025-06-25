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

import { Selectable, sql } from 'kysely'
import z from 'zod'
import { ActionStatus, Draft, TokenUserType, UUID } from '@opencrvs/commons'
import { db } from '@events/storage/postgres/events/db'
import EventActionDrafts, {
  NewEventActionDrafts
} from './schema/app/EventActionDrafts'
import ActionType from './schema/app/ActionType'

export async function createDraft(draft: NewEventActionDrafts) {
  const result = await db
    .insertInto('eventActionDrafts')
    .values(draft)
    .onConflict((oc) =>
      oc.columns(['transactionId', 'actionType']).doUpdateSet({
        declaration: sql`EXCLUDED.declaration`,
        annotation: sql`EXCLUDED.annotation`,
        createdAt: sql`NOW()`
      })
    )
    .returning(['id', 'eventId', 'transactionId', 'declaration', 'annotation'])
    .executeTakeFirst()

  return result
}

function transformDraft(draft: Selectable<EventActionDrafts>): Draft {
  return {
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
  }
}

export async function getDraftsByUserId(createdBy: string) {
  const drafts = await db
    .selectFrom('eventActionDrafts')
    .where('createdBy', '=', createdBy)
    .selectAll()
    .execute()
  const draftDocuments = drafts.map(transformDraft)

  return z.array(Draft).parse(draftDocuments satisfies Draft[])
}

export async function getDraftsForAction(
  eventId: UUID,
  createdBy: string,
  actionType: ActionType
) {
  const drafts = await db
    .selectFrom('eventActionDrafts')
    .where('eventId', '=', eventId)
    .where('createdBy', '=', createdBy)
    .where('actionType', '=', actionType)
    .selectAll()
    .execute()
  const draftDocuments = drafts.map(transformDraft)

  return z.array(Draft).parse(draftDocuments satisfies Draft[])
}

export async function deleteDraftsByEventId(eventId: UUID) {
  return db
    .deleteFrom('eventActionDrafts')
    .where('eventId', '=', eventId)
    .execute()
}
