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
import { DateTime } from 'luxon'
import {
  ActionStatus,
  ActionType,
  EventDocument,
  getUUID,
  logger,
  UUID
} from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import { dropNulls } from '../drop-nulls'
import { buildAction } from '../../../service/events/events'
import { TrpcUserContext } from '../../../context'
import { EventActions, NewEventActions } from './schema/app/EventActions'
import { Events, NewEvents } from './schema/app/Events'
import Schema from './schema/Database'

export const STREAM_BATCH_SIZE = 1000

function toEventDocument(
  { eventType, ...event }: Events,
  actions: EventActions[]
) {
  const notNullActions = actions.map(({ actionType, ...action }) =>
    dropNulls({
      ...action,
      type: actionType
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

async function* processBatch(batch: Events[]) {
  const db = getClient()
  const ids = batch.map((event) => event.id)
  const actions = await db
    .selectFrom('eventActions')
    .selectAll()
    .where('eventId', 'in', ids)
    .execute()

  const byEventId = actions.reduce<Record<string, EventActions[] | undefined>>(
    (actionsByEventId, action) => ({
      ...actionsByEventId,
      [action.eventId]: (actionsByEventId[action.eventId] || []).concat(action)
    }),
    {}
  )

  for (const event of batch) {
    try {
      const doc = toEventDocument(event, byEventId[event.id] ?? [])
      const doc = toEventDocument(event, byEventId[event.id] ?? [])
      yield doc
      yield doc
    } catch (err) {
      logger.error({
        message: 'Failed to convert event to document',
        eventId: event.id,
        error: (err as Error).message,
        stack: (err as Error).stack
      })
    }
  }
}

/*
 * Returns a stream of events directly from Postgres.
 * Useful for cases where you want every event to be processed in bulk,
 * for example, reindexing to ElasticSearch.
 */
export async function* streamEventDocuments() {
  const db = getClient()
  const eventsStream = db.selectFrom('events').selectAll().stream()
  let batch: Events[] = []

  for await (const row of eventsStream) {
    batch.push(row)
    if (batch.length === STREAM_BATCH_SIZE) {
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
 * @idempotent with `transactionId, actionType, status`
 * @returns action id
 */
export async function createActionInTrx(
  action: NewEventActions,
  trx: Kysely<Schema>
) {
  await trx
    .insertInto('eventActions')
    .values(action)
    .onConflict((oc) =>
      oc.columns(['transactionId', 'actionType', 'status']).doNothing()
    )
    .execute()

  return trx
    .selectFrom('eventActions')
    .select('id')
    .where('transactionId', '=', action.transactionId)
    .where('actionType', '=', action.actionType)
    .where('status', '=', action.status)
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
      createdAtLocation: input.createdAtLocation
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
      createdAtLocation: input.createdAtLocation
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
      assignedTo: input.createdBy
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

/**
 *
 * Creates multiple actions in one query.
 * Useful for reducing the number of database round trips (e.g. marking multiple events as read)
 */
async function createActionsInTrx(
  actions: NewEventActions[],
  trx: Kysely<Schema>
) {
  if (actions.length === 0) {
    return
  }

  await trx
    .insertInto('eventActions')
    .values(actions)
    .onConflict((oc) =>
      oc.columns(['transactionId', 'actionType', 'status']).doNothing()
    )
    .execute()
}

/**
 *
 * @returns all events with the given ids in one query.
 */
async function getEventsByIdsInTrx(
  trx: Kysely<Schema>,
  eventIds: UUID[]
): Promise<EventDocument[]> {
  const events = (await trx
    .selectFrom('events')
    .selectAll('events')
    .select(() =>
      sql`json_agg(
      jsonb_strip_nulls(to_jsonb(${sql.ref('eventActions')}))
      ORDER BY
        CASE WHEN ${sql.ref('eventActions.actionType')} = 'CREATE' THEN 0 ELSE 1 END,
        ${sql.ref('eventActions.createdAt')}
    )`.as('actions')
    )
    .leftJoin('eventActions', 'eventActions.eventId', 'events.id')
    .where('events.id', 'in', eventIds)
    .groupBy('events.id')
    .orderBy('events.id')
    // We parse on the next step so casting mistakes will be caught immediately.
    .execute()) as (Events & { actions: EventActions[] })[]

  return events.map((event) =>
    EventDocument.parse({
      ...event,
      type: event.eventType,
      actions: event.actions.map(({ actionType, createdAt, ...rest }) => {
        return {
          ...rest,
          type: actionType,
          // turns db format +00 to Z format
          createdAt: DateTime.fromISO(createdAt).toISO()
        }
      })
    })
  )
}

/**
 *
 * @param eventIds array of event IDs to fetch
 * @returns Get events while adding READ action for each of them.
 */
export async function getEventsAuditTrailed(
  user: TrpcUserContext,
  eventIds: UUID[]
) {
  const readActions = eventIds.map((eventId) =>
    buildAction(
      {
        type: ActionType.READ,
        declaration: {},
        eventId,
        transactionId: getUUID()
      },
      ActionStatus.Accepted,
      user
    )
  )

  const db = getClient()
  return db.transaction().execute(async (trx) => {
    await createActionsInTrx(readActions, trx)

    return getEventsByIdsInTrx(trx, eventIds)
  })
}
