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
import { CommonQueryMethods } from 'slonik'
import {
  ActionDocument,
  ActionStatus,
  ActionType,
  EventDocument,
  UUID
} from '@opencrvs/commons'
import { getClient, sql } from './db'

export async function getEventByIdInTransaction(
  eventId: UUID,
  trx: CommonQueryMethods
): Promise<EventDocument> {
  const event = await trx.one(sql.type(EventDocument.omit({ actions: true }))`
    SELECT
      id,
      event_type AS type,
      date_of_event_field_id AS "dateOfEventFieldId",
      created_at AS "createdAt",
      updated_at AS "updatedAt",
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
      created_at AS "createdAt",
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

  await db.query(sql.typeAlias('void')`
    DELETE FROM events
    WHERE
      id = ${eventId}
  `)
}

export async function findEventByTransactionId(
  transactionId: string
): Promise<EventDocument | undefined> {
  const db = await getClient()

  return db.transaction(async (trx) => {
    const event = await trx.maybeOne(sql.type(
      EventDocument.omit({ actions: true })
    )`
      SELECT
        id,
        event_type AS type,
        date_of_event_field_id AS "dateOfEventFieldId",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        tracking_id AS "trackingId"
      FROM
        events
      WHERE
        transaction_id = ${transactionId}
    `)

    if (!event) {
      return undefined
    }

    const actions = await trx.any(sql.type(ActionDocument)`
      SELECT
        id,
        transaction_id AS "transactionId",
        created_at AS "createdAt",
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
  })
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
  createdAtLocation: string
}) => {
  const db = await getClient()

  return db.transaction(async (trx) => {
    const { id: eventId } = await trx.one(sql.type(z.object({ id: UUID }))`
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
      ON CONFLICT (transaction_id) DO NOTHING
      RETURNING
        id
    `)

    await trx.query(sql.type(z.void())`
      INSERT INTO
        event_actions (
          event_id,
          transaction_id,
          action_type,
          declaration,
          annotation,
          status,
          original_action_id,
          created_by,
          created_by_role,
          created_at_location
        )
      VALUES
        (
          ${eventId},
          ${transactionId},
          ${ActionType.CREATE},
          '{}'::jsonb,
          '{}'::jsonb,
          ${ActionStatus.Accepted}::action_status,
          NULL,
          ${createdBy},
          ${createdByRole},
          ${createdAtLocation}
        )
      ON CONFLICT (transaction_id) DO NOTHING
    `)

    await trx.query(sql.type(z.void())`
      INSERT INTO
        event_actions (
          event_id,
          transaction_id,
          action_type,
          assigned_to,
          declaration,
          annotation,
          status,
          original_action_id,
          created_by,
          created_by_role,
          created_at_location
        )
      VALUES
        (
          ${eventId},
          ${transactionId},
          ${ActionType.ASSIGN},
          ${createdBy},
          '{}'::jsonb,
          '{}'::jsonb,
          ${ActionStatus.Accepted}::action_status,
          NULL,
          ${createdBy},
          ${createdByRole},
          ${createdAtLocation}
        )
      ON CONFLICT (transaction_id) DO NOTHING
    `)

    return getEventByIdInTransaction(eventId, trx)
  })
}
