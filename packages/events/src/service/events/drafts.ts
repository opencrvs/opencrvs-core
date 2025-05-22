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

import { Draft, DraftInput } from '@opencrvs/commons/events'
import { UUID } from '@opencrvs/commons'
import { getClient, sql } from '@events/storage/postgres/events/db'

export async function createDraft(
  input: DraftInput,
  {
    eventId,
    createdBy,
    createdByRole,
    createdAtLocation,
    transactionId
  }: {
    eventId: UUID
    createdBy: string
    createdByRole: string
    createdAtLocation: string
    token: string
    transactionId: string
  }
) {
  const db = await getClient()

  const draft = await db.one(sql.type(Draft)`
    INSERT INTO
      event_action_drafts (
        event_id,
        transaction_id,
        action_type,
        declaration,
        annotation,
        created_by,
        created_by_role,
        created_at_location
      )
    VALUES
      (
        ${eventId},
        ${transactionId},
        ${input.type},
        ${sql.jsonb(input.declaration)},
        ${sql.jsonb(input.annotation)},
        ${createdBy},
        ${createdByRole},
        ${createdAtLocation}
      )
    ON CONFLICT (transaction_id) DO UPDATE
    SET
      declaration = EXCLUDED.declaration,
      annotation = EXCLUDED.annotation,
      created_at = now()
    RETURNING
      id,
      event_id AS "eventId",
      transaction_id AS "transactionId",
      declaration,
      annotation
  `)

  return draft
}

export async function getDraftsByUserId(createdBy: string) {
  const db = await getClient()
  const drafts = await db.any(sql.type(Draft)`
    SELECT
      id,
      event_id AS "eventId",
      transaction_id AS "transactionId",
      declaration,
      annotation
    FROM
      event_action_drafts
    WHERE
      created_by = ${createdBy}
  `)

  return [...drafts]
}

export async function getDraftsForAction(
  eventId: UUID,
  createdBy: string,
  actionType: string
) {
  const db = await getClient()
  const drafts = await db.any(sql.type(Draft)`
    SELECT
      id,
      event_id AS "eventId",
      transaction_id AS "transactionId",
      declaration,
      annotation
    FROM
      event_action_drafts
    WHERE
      event_id = ${eventId}
      AND created_by = ${createdBy}
      AND action_type = ${actionType}
  `)

  return [...drafts]
}

export async function deleteDraftsByEventId(eventId: UUID) {
  const db = await getClient()
  return db.query(sql.typeAlias('void')`
    DELETE FROM event_action_drafts
    WHERE
      event_id = ${eventId}
  `)
}
