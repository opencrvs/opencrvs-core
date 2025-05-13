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

import { DraftInput, ActionStatus, Draft } from '@opencrvs/commons/events'

import { getClient, sql } from '@events/storage/postgres/events'

export async function createDraft(
  input: DraftInput,
  {
    eventId,
    createdBy,
    createdByRole,
    createdAtLocation,
    transactionId
  }: {
    eventId: string
    createdBy: string
    createdByRole: string
    createdAtLocation: string
    token: string
    transactionId: string
  }
) {
  const db = await getClient()

  const draft = await db.one(sql.typeAlias('draft')`
    INSERT INTO secure.event_action_drafts (
      event_id,
      transaction_id,
      action_type,
      declaration,
      annotations,
      status,
      created_by,
      created_by_role,
      created_at_location
    )
    VALUES (
      ${eventId},
      ${transactionId},
      ${input.type},
      ${sql.jsonb(input.declaration)},
      ${sql.jsonb(input.annotation)},
      ${ActionStatus.Accepted},
      ${createdBy},
      ${createdByRole},
      ${createdAtLocation} 
    )
    ON CONFLICT (transaction_id) DO UPDATE
    SET declaration = EXCLUDED.declaration,
        annotations = EXCLUDED.annotations,
        created_at = now()
    RETURNING 
      id,
      event_id AS "eventId",
      transaction_id AS "transactionId",
      declaration,
      annotations
  `)

  return draft
}

export async function getDraftsByUserId(createdBy: string) {
  const db = await getClient()
  const drafts = await db.any(sql.typeAlias('draft')`
    SELECT
      id,
      event_id AS "eventId",
      transaction_id AS "transactionId",
      declaration,
      annotations
    FROM
      secure.event_action_drafts
    WHERE created_by = ${createdBy}
  `)
  return drafts
}

export async function getDraftsForAction(
  eventId: string,
  createdBy: string,
  actionType: string
) {
  const db = await getClient()
  const drafts = await db.any(sql.typeAlias('draft')`
    SELECT
      id,
      event_id AS "eventId",
      transaction_id AS "transactionId",
      declaration,
      annotations
    FROM
      secure.event_action_drafts
    WHERE
      event_id = ${eventId}
      AND created_by = ${createdBy}
      AND action_type = ${actionType}
  `)

  return [...drafts]
}

export async function deleteDraftsByEventId(eventId: string) {
  const db = await getClient()
  await db.any(sql.typeAlias('void')`
    DELETE FROM secure.event_action_drafts WHERE event_id = ${eventId}
  `)
}
