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
      action_type AS "type",
      annotation,
      assigned_to AS "assignedTo",
      created_at_location AS "createdAtLocation",
      ${formatTimestamp('created_at')} AS "createdAt",
      created_by AS "createdBy",
      created_by_role AS "createdByRole",
      declaration,
      id,
      original_action_id AS "originalActionId",
      registration_number AS "registrationNumber",
      CASE
        WHEN reason_message IS NULL THEN NULL
        ELSE jsonb_build_object(
          'is_duplicate',
          reason_is_duplicate,
          'message',
          reason_message
        )
      END AS reason,
      status,
      transaction_id AS "transactionId"
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

  await db.transaction(async (trx) => {
    await trx.query(sql.type(z.void())`
      DELETE FROM event_actions
      WHERE
        event_id = ${eventId}
    `)

    await trx.query(sql.type(z.void())`
      DELETE FROM events
      WHERE
        id = ${eventId}
    `)
  })
}

export const createEvent = async (
  {
    type,
    transactionId,
    trackingId
  }: {
    type: string
    transactionId: string
    trackingId: string
  },
  trx: CommonQueryMethods
) => {
  return trx.one(sql.type(z.object({ id: UUID }))`
    INSERT INTO
      events (event_type, transaction_id, tracking_id)
    VALUES
      (
        ${type},
        ${transactionId},
        ${trackingId}
      )
    RETURNING
      id
  `)
}

/**
 * Idempotently inserts an action into the event_actions table
 * @returns the id of the action
 */
async function createActionInTransaction(
  {
    annotation,
    assignedTo,
    createdAtLocation,
    createdBy,
    createdByRole,
    createdBySignature,
    declaration,
    eventId,
    originalActionId,
    reasonIsDuplicate,
    reasonMessage,
    registrationNumber,
    status,
    transactionId,
    type
  }: {
    annotation?: Record<string, SerializableValue>
    assignedTo?: string
    createdAtLocation?: UUID
    createdBy: string
    createdByRole: string
    createdBySignature?: string
    declaration?: Record<string, SerializableValue>
    eventId: UUID
    originalActionId?: UUID
    reasonIsDuplicate?: boolean
    reasonMessage?: string
    registrationNumber?: string
    status: ActionStatus
    transactionId: string
    type: ActionType
  },
  trx: CommonQueryMethods
) {
  const result = await trx.maybeOneFirst(sql.type(z.object({ id: UUID }))`
    INSERT INTO
      event_actions (
        action_type,
        annotation,
        assigned_to,
        created_at_location,
        created_by_role,
        created_by_signature,
        created_by,
        declaration,
        event_id,
        original_action_id,
        reason_is_duplicate,
        reason_message,
        registration_number,
        status,
        transaction_id
      )
    VALUES
      (
        ${type}::action_type,
        ${sql.jsonb(annotation ?? {})},
        ${assignedTo ?? null},
        ${createdAtLocation ?? null}::uuid,
        ${createdByRole},
        ${createdBySignature ?? null},
        ${createdBy},
        ${sql.jsonb(declaration ?? {})},
        ${eventId},
        ${originalActionId ?? null}::uuid,
        ${reasonIsDuplicate ?? null},
        ${reasonMessage ?? null},
        ${registrationNumber ?? null},
        ${status}::action_status,
        ${transactionId}
      )
    ON CONFLICT (action_type, transaction_id) DO NOTHING
    RETURNING
      id
  `)

  const id =
    result ??
    (await trx.oneFirst(sql.type(z.object({ id: UUID }))`
      SELECT
        id
      FROM
        event_actions
      WHERE
        transaction_id = ${transactionId}
        AND action_type = ${type}::action_type
    `))

  return id
}

export const createAction = async (
  params: Parameters<typeof createActionInTransaction>[0]
) => {
  const db = await getClient()
  return db.transaction(async (trx) => createActionInTransaction(params, trx))
}

export const getOrCreateEventInTransaction = async (
  {
    type,
    transactionId,
    trackingId,
    createdBy,
    createdByRole,
    createdBySignature,
    createdAtLocation
  }: {
    type: string
    transactionId: string
    trackingId: string
    createdBy: string
    createdByRole: string
    createdBySignature?: string
    createdAtLocation?: UUID
  },
  trx: CommonQueryMethods
) => {
  const eventId =
    (await trx.maybeOneFirst(sql.type(z.object({ id: UUID }))`
      INSERT INTO
        events (event_type, transaction_id, tracking_id)
      VALUES
        (
          ${type},
          ${transactionId},
          ${trackingId}
        )
      ON CONFLICT (transaction_id) DO NOTHING
      RETURNING
        id
    `)) ??
    (await trx.oneFirst(sql.type(z.object({ id: UUID }))`
      SELECT
        id
      FROM
        events
      WHERE
        transaction_id = ${transactionId}
    `))

  await createActionInTransaction(
    {
      eventId,
      transactionId,
      type: ActionType.CREATE,
      status: ActionStatus.Accepted,
      createdBy,
      createdByRole,
      createdBySignature,
      createdAtLocation
    },
    trx
  )

  return getEventByIdInTransaction(eventId, trx)
}

export const getOrCreateEvent = async (
  params: Parameters<typeof getOrCreateEventInTransaction>[0]
): Promise<EventDocument> => {
  const db = await getClient()
  return db.transaction(async (trx) =>
    getOrCreateEventInTransaction(params, trx)
  )
}

export const getOrCreateEventAndAssign = async ({
  type,
  transactionId,
  trackingId,
  createdBy,
  createdByRole,
  createdBySignature,
  createdAtLocation
}: {
  type: string
  transactionId: string
  trackingId: string
  createdBy: string
  createdByRole: string
  createdBySignature?: string
  createdAtLocation?: UUID
}) => {
  const db = await getClient()

  return db.transaction(async (trx) => {
    const { id: eventId } = await getOrCreateEventInTransaction(
      {
        type,
        transactionId,
        trackingId,
        createdBy,
        createdByRole,
        createdBySignature,
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
        createdBySignature,
        createdAtLocation,
        assignedTo: createdBy
      },
      trx
    )

    return getEventByIdInTransaction(eventId, trx)
  })
}
