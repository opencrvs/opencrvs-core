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

import z from 'zod'
import { CommonQueryMethods, SerializableValue } from 'slonik'
import {
  ActionDocument,
  ActionStatus,
  ActionType,
  EventDocument,
  UUID
} from '@opencrvs/commons'
import { formatTimestamp, getClient, sql } from './db'

async function getEventByIdInTransaction(
  eventId: UUID,
  trx: CommonQueryMethods
): Promise<EventDocument> {
  const event = await trx.one(sql.type(EventDocument.omit({ actions: true }))`
    SELECT
      id,
      event_type AS type,
      date_of_event_field_id AS "dateOfEventFieldId",
      ${formatTimestamp('created_at')} AS "createdAt",
      ${formatTimestamp('updated_at')} AS "updatedAt",
      tracking_id AS "trackingId"
    FROM
      events
    WHERE
      id = ${eventId}
  `)

  const actions = await trx.any(sql.type(ActionDocument)`
    SELECT
      id,
      transaction_id AS "transactionId",
      ${formatTimestamp('created_at')} AS "createdAt",
      created_by AS "createdBy",
      created_by_role AS "createdByRole",
      declaration,
      annotation,
      created_at_location AS "createdAtLocation",
      status,
      action_type AS "type",
      original_action_id AS "originalActionId"
    FROM
      event_actions
    WHERE
      event_id = ${event.id}
  `)

  return {
    ...event,
    actions: [...actions]
  }
}

export async function getEventById(id: UUID): Promise<EventDocument> {
  const db = await getClient()

  const result = await db.transaction(async (trx) =>
    getEventByIdInTransaction(id, trx)
  )

  return result
}

export async function deleteEventById(eventId: UUID): Promise<void> {
  const db = await getClient()

  await db.query(sql.type(z.void())`
    DELETE FROM events
    WHERE
      id = ${eventId}
  `)
}

export const createEvent = async (
  {
    type,
    transactionId,
    trackingId,
    fieldId
  }: {
    type: string
    transactionId: string
    trackingId: string
    fieldId?: string
  },
  trx: CommonQueryMethods
) => {
  return trx.one(sql.type(z.object({ id: UUID }))`
    INSERT INTO
      events (
        event_type,
        transaction_id,
        tracking_id,
        date_of_event_field_id
      )
    VALUES
      (
        ${type},
        ${transactionId},
        ${trackingId},
        ${fieldId ?? null}
      )
    RETURNING
      id
  `)
}

async function createActionInTransaction(
  {
    eventId,
    transactionId,
    type,
    status,
    createdBy,
    createdByRole,
    createdAtLocation,
    declaration,
    annotation,
    originalActionId
  }: {
    eventId: UUID
    transactionId: string
    type: ActionType
    status: ActionStatus
    createdBy: string
    createdByRole: string
    createdAtLocation: UUID
    declaration?: Record<string, SerializableValue>
    annotation?: Record<string, SerializableValue>
    originalActionId?: UUID
  },
  trx: CommonQueryMethods
) {
  // @TODO: Some typing error here
  const originalActionIdx = originalActionId as string | undefined

  const id = await trx.oneFirst(sql.type(z.object({ id: UUID }))`
    INSERT INTO
      event_actions (
        event_id,
        transaction_id,
        action_type,
        status,
        declaration,
        annotation,
        created_by,
        created_by_role,
        created_at_location,
        original_action_id
      )
    VALUES
      (
        ${eventId},
        ${transactionId},
        ${type}::action_type,
        ${status}::action_status,
        ${sql.jsonb(declaration ?? {})},
        ${sql.jsonb(annotation ?? {})},
        ${createdBy},
        ${createdByRole},
        ${createdAtLocation},
        ${originalActionIdx ?? null}::uuid
      )
    ON CONFLICT (action_type, transaction_id) DO UPDATE -- no-op, DO NOTHING would not return the id
    SET
      action_type = event_actions.action_type
    RETURNING
      id
  `)

  return id
}

export const createAction = async (
  params: Parameters<typeof createActionInTransaction>[0]
) => {
  const db = await getClient()
  return db.transaction(async (trx) => createActionInTransaction(params, trx))
}

export const getOrCreateEvent = async ({
  type,
  transactionId,
  trackingId,
  fieldId,
  createdBy,
  createdByRole,
  createdAtLocation
}: {
  type: string
  transactionId: string
  trackingId: string
  fieldId?: string
  createdBy: string
  createdByRole: string
  createdAtLocation: UUID
}) => {
  const db = await getClient()

  return db.transaction(async (trx) => {
    const eventId = await trx.oneFirst(sql.type(z.object({ id: UUID }))`
      INSERT INTO
        events (
          event_type,
          transaction_id,
          tracking_id,
          date_of_event_field_id
        )
      VALUES
        (
          ${type},
          ${transactionId},
          ${trackingId},
          ${fieldId ?? null}
        )
      ON CONFLICT (transaction_id) DO UPDATE
      SET
        updated_at = NOW()
      RETURNING
        id
    `)

    await createActionInTransaction(
      {
        eventId,
        transactionId,
        type: ActionType.CREATE,
        status: ActionStatus.Accepted,
        createdBy,
        createdByRole,
        createdAtLocation
      },
      trx
    )

    await createActionInTransaction(
      {
        eventId,
        transactionId,
        type: ActionType.ASSIGN,
        status: ActionStatus.Accepted,
        createdBy,
        createdByRole,
        createdAtLocation
      },
      trx
    )

    return getEventByIdInTransaction(eventId, trx)
  })
}
