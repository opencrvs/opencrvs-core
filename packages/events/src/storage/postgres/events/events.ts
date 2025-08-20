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

import { Kysely, sql } from 'kysely'
import {
  ActionStatus,
  ActionType,
  EventDocument,
  UUID
} from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import { dropNulls } from '../drop-nulls'
import { EventActions, NewEventActions } from './schema/app/EventActions'
import { Events, NewEvents } from './schema/app/Events'
import Schema from './schema/Database'

function toEventDocument(
  { eventType, ...event }: Events,
  actions: EventActions[]
) {
  const notNullActions = actions.map(
    ({ actionType, reasonIsDuplicate, reasonMessage, ...action }) =>
      dropNulls({
        ...action,
        type: actionType,
        reason: (reasonIsDuplicate || reasonMessage) && {
          isDuplicate: reasonIsDuplicate,
          message: reasonMessage
        }
      })
  )

  return EventDocument.parse({
    ...event,
    type: eventType,
    actions: notNullActions
  })
}

export async function getEventByIdInTrx(id: UUID, trx: Kysely<Schema>) {
  const event = await trx
    .selectFrom('events')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow()

  const actions = await trx
    .selectFrom('eventActions')
    .selectAll()
    .where('eventId', '=', event.id)
    .orderBy(
      sql`CASE WHEN ${sql.ref('actionType')} = 'CREATE' THEN 0 ELSE 1 END`,
      'asc'
    )
    .orderBy('createdAt', 'asc')
    .execute()

  return toEventDocument(event, actions)
}

async function* processBatch(batch: any[]) {
  const db = getClient()
  const ids = batch.map((e) => e.id)
  const actions = await db
    .selectFrom('eventActions')
    .selectAll()
    .where('eventId', 'in', ids)
    .execute()

  const byEventId = actions.reduce<Record<string, any[]>>((m, a) => {
    ;(m[a.eventId] ??= []).push(a)
    return m
  }, {})

  for (const e of batch) {
    yield toEventDocument(e, byEventId[e.id] ?? [])
  }
}

export async function* streamEventsWithActions() {
  const db = getClient()
  const it = db.selectFrom('events').selectAll().stream() // AsyncIterable
  let batch: any[] = []

  for await (const row of it) {
    batch.push(row)
    if (batch.length === 1000) {
      yield* processBatch(batch)
      batch = []
    }
  }
  if (batch.length) {
    yield* processBatch(batch)
  }
}

export const getEventById = async (id: UUID) => {
  const db = getClient()
  return db.transaction().execute(async (trx) => {
    return getEventByIdInTrx(id, trx)
  })
}

export async function deleteEventByIdInTrx(eventId: UUID, trx: Kysely<Schema>) {
  await trx.deleteFrom('eventActions').where('eventId', '=', eventId).execute()
  await trx.deleteFrom('events').where('id', '=', eventId).execute()
}

export async function deleteEventById(eventId: UUID) {
  const db = getClient()

  return db.transaction().execute(async (trx) => {
    await deleteEventByIdInTrx(eventId, trx)
  })
}

export async function createEventInTrx(event: NewEvents, trx: Kysely<Schema>) {
  await trx
    .insertInto('events')
    .values(event)
    .onConflict((oc) => oc.columns(['transactionId', 'eventType']).doNothing())
    .executeTakeFirstOrThrow()

  return trx
    .selectFrom('events')
    .select('id')
    .where('transactionId', '=', event.transactionId)
    .where('eventType', '=', event.eventType)
    .executeTakeFirstOrThrow()
}

/**
 * Creates a new action in the event_actions table
 * @idempotent with `transactionId, actionType`
 * @returns action id
 */
export async function createActionInTrx(
  action: NewEventActions,
  trx: Kysely<Schema>
) {
  await trx
    .insertInto('eventActions')
    .values(action)
    .onConflict((oc) => oc.columns(['transactionId', 'actionType']).doNothing())
    .execute()

  return trx
    .selectFrom('eventActions')
    .select('id')
    .where('transactionId', '=', action.transactionId)
    .where('actionType', '=', action.actionType)
    .executeTakeFirstOrThrow()
}

export const createAction = async (action: NewEventActions) => {
  const db = getClient()
  return db.transaction().execute(async (trx) => {
    return createActionInTrx(action, trx)
  })
}

async function getOrCreateEventInTrx(
  input: NewEvents & Omit<NewEventActions, 'actionType' | 'eventId' | 'status'>,
  trx: Kysely<Schema>
) {
  await trx
    .insertInto('events')
    .values({
      eventType: input.eventType,
      transactionId: input.transactionId,
      trackingId: input.trackingId,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt
    })
    .onConflict((oc) => oc.columns(['transactionId', 'eventType']).doNothing())
    .execute()

  const { id: newId } = await trx
    .selectFrom('events')
    .select('id')
    .where('transactionId', '=', input.transactionId)
    .where('eventType', '=', input.eventType)
    .executeTakeFirstOrThrow()

  await createActionInTrx(
    {
      eventId: newId,
      transactionId: input.transactionId,
      actionType: ActionType.CREATE,
      status: ActionStatus.Accepted,
      createdBy: input.createdBy,
      createdByRole: input.createdByRole,
      createdByUserType: input.createdByUserType,
      createdBySignature: input.createdBySignature,
      createdAtLocation: input.createdAtLocation,
      reasonIsDuplicate: input.reasonIsDuplicate,
      reasonMessage: input.reasonMessage
    },
    trx
  )

  return getEventByIdInTrx(newId, trx)
}

async function getOrCreateEventAndAssignInTrx(
  input: Parameters<typeof getOrCreateEventInTrx>[0],
  trx: Kysely<Schema>
) {
  await trx
    .insertInto('events')
    .values({
      eventType: input.eventType,
      transactionId: input.transactionId,
      trackingId: input.trackingId,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt
    })
    .onConflict((oc) => oc.columns(['transactionId', 'eventType']).doNothing())
    .execute()

  const { id: newId } = await trx
    .selectFrom('events')
    .select('id')
    .where('transactionId', '=', input.transactionId)
    .where('eventType', '=', input.eventType)
    .executeTakeFirstOrThrow()

  await createActionInTrx(
    {
      eventId: newId,
      transactionId: input.transactionId,
      actionType: ActionType.CREATE,
      status: ActionStatus.Accepted,
      createdBy: input.createdBy,
      createdByRole: input.createdByRole,
      createdByUserType: input.createdByUserType,
      createdBySignature: input.createdBySignature,
      createdAtLocation: input.createdAtLocation,
      reasonIsDuplicate: input.reasonIsDuplicate,
      reasonMessage: input.reasonMessage
    },
    trx
  )

  await createActionInTrx(
    {
      eventId: newId,
      transactionId: input.transactionId,
      actionType: ActionType.ASSIGN,
      status: ActionStatus.Accepted,
      createdBy: input.createdBy,
      createdByRole: input.createdByRole,
      createdByUserType: input.createdByUserType,
      createdBySignature: input.createdBySignature,
      createdAtLocation: input.createdAtLocation,
      assignedTo: input.createdBy,
      reasonIsDuplicate: input.reasonIsDuplicate,
      reasonMessage: input.reasonMessage
    },
    trx
  )

  return getEventByIdInTrx(newId, trx)
}

export const getOrCreateEvent = async (
  input: Parameters<typeof getOrCreateEventInTrx>[0]
) => {
  const db = getClient()

  return db.transaction().execute(async (trx) => {
    return getOrCreateEventInTrx(input, trx)
  })
}

export const getOrCreateEventAndAssign = async (
  input: Parameters<typeof getOrCreateEventAndAssignInTrx>[0]
) => {
  const db = getClient()

  return db.transaction().execute(async (trx) => {
    return getOrCreateEventAndAssignInTrx(input, trx)
  })
}
