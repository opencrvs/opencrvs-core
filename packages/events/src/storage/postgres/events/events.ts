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
      id,
      transaction_id AS "transactionId",
      action_type AS "type",
      registration_number AS "registrationNumber",
      status,
      declaration,
      annotation,
      assigned_to AS "assignedTo",
      created_by AS "createdBy",
      created_by_role AS "createdByRole",
      original_action_id AS "originalActionId",
      created_at_location AS "createdAtLocation",
      ${formatTimestamp('created_at')} AS "createdAt"
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
    eventId,
    transactionId,
    registrationNumber,
    type,
    status,
    createdBy,
    createdByRole,
    createdBySignature,
    createdAtLocation,
    declaration,
    annotation,
    originalActionId,
    assignedTo
  }: {
    eventId: UUID
    transactionId: string
    registrationNumber?: string
    type: ActionType
    status: ActionStatus
    createdBy: string
    createdByRole: string
    createdBySignature?: string
    createdAtLocation?: UUID
    declaration?: Record<string, SerializableValue>
    annotation?: Record<string, SerializableValue>
    originalActionId?: UUID
    assignedTo?: string
  },
  trx: CommonQueryMethods
) {
  // @TODO: Some typing error here
  const originalActionIdx = originalActionId as string | undefined
  // @TODO: Some typing error here
  const createdAtLocationx = createdAtLocation as string | undefined

  const result = await trx.maybeOneFirst(sql.type(z.object({ id: UUID }))`
    INSERT INTO
      event_actions (
        event_id,
        transaction_id,
        registration_number,
        action_type,
        assigned_to,
        status,
        declaration,
        annotation,
        created_by,
        created_by_role,
        created_by_signature,
        created_at_location,
        original_action_id
      )
    VALUES
      (
        ${eventId},
        ${transactionId},
        ${registrationNumber ?? null},
        ${type}::action_type,
        ${assignedTo ?? null},
        ${status}::action_status,
        ${sql.jsonb(declaration ?? {})},
        ${sql.jsonb(annotation ?? {})},
        ${createdBy},
        ${createdByRole},
        ${createdBySignature ?? null},
        ${createdAtLocationx ?? null}::uuid,
        ${originalActionIdx ?? null}::uuid
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

export const getOrCreateEvent = async ({
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
    const eventId = await trx.oneFirst(sql.type(z.object({ id: UUID }))`
      INSERT INTO
        events (event_type, transaction_id, tracking_id)
      VALUES
        (
          ${type},
          ${transactionId},
          ${trackingId}
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
