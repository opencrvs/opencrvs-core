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

import { Kysely } from 'kysely'
import _ from 'lodash'
import {
  ActionStatus,
  ActionType,
  deepDropNulls,
  EventDocument,
  UUID
} from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import { EventActions, NewEventActions } from './schema/app/EventActions'
import { Events, NewEvents } from './schema/app/Events'
import Schema from './schema/Database'

async function getEventByIdInTrx(id: UUID, trx: Kysely<Schema>) {
  const event = await trx
    .selectFrom('events')
    .select(['id', 'eventType as type', 'createdAt', 'updatedAt', 'trackingId'])
    .where('id', '=', id)
    .executeTakeFirstOrThrow()

  const actions = await trx
    .selectFrom('eventActions')
    .selectAll()
    .where('eventId', '=', event.id)
    .execute()

  const result = {
    ...event,
    actions: actions.map(
      ({ actionType, reasonIsDuplicate, reasonMessage, ...action }) => ({
        ...action,
        type: actionType,
        reason: (reasonIsDuplicate || reasonMessage) && {
          isDuplicate: reasonIsDuplicate,
          message: reasonMessage
        }
      })
    )
  }

  const cleanedActions = result.actions.map((action) =>
    _.omitBy(
      action,
      (value, key) =>
        _.isNil(value) &&
        // For now, assignedTo is the only exception to the rule of dropping nulls.
        !(action.type === ActionType.UNASSIGN && key === 'assignedTo')
    )
  )

  return EventDocument.parse({
    ...result,
    actions: cleanedActions
  })
}

export const getEventById = async (id: UUID) => {
  const db = getClient()
  return db.transaction().execute(async (trx) => {
    return getEventByIdInTrx(id, trx)
  })
}

export async function deleteEventById(eventId: UUID) {
  const db = getClient()

  return db.transaction().execute(async (trx) => {
    await trx
      .deleteFrom('eventActions')
      .where('eventId', '=', eventId)
      .execute()

    await trx.deleteFrom('events').where('id', '=', eventId).execute()
  })
}

async function createEventInTrx(event: NewEvents, trx: Kysely<Schema>) {
  const result = await trx
    .insertInto('events')
    .values(event)
    .returning('id')
    .executeTakeFirstOrThrow()

  return { id: result.id }
}

export const createEvent = async (
  event: Parameters<typeof createEventInTrx>[0]
) => {
  const db = getClient()

  return db.transaction().execute(async (trx) => {
    return createEventInTrx(event, trx)
  })
}

/**
 * Creates a new action in the event_actions table
 * @idempotent with `transactionId, actionType`
 * @returns action id
 */
async function createActionInTrx(action: NewEventActions, trx: Kysely<Schema>) {
  // @TODO:
  const withoutUndefined = _.omitBy(action, _.isUndefined) as any
  await trx.insertInto('eventActions').values(withoutUndefined).execute()

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

export const createEventWithActions = async (
  event: Events,
  actions: Array<Omit<EventActions, 'eventId'>>
) => {
  const db = getClient()
  return db.transaction().execute(async (trx) => {
    const { id: eventId } = await createEventInTrx(event, trx)

    for (const action of actions) {
      await createActionInTrx({ ...action, eventId }, trx)
    }

    return getEventByIdInTrx(eventId, trx)
  })
}
