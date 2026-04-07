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

import type {
  EventActionAuditLog,
  EventCreateAuditLog,
  EventCustomActionAuditLog
} from '@opencrvs/commons/events'
import { Pool, PoolClient } from 'pg'

const EVENTS_POSTGRES_URL =
  process.env.EVENTS_POSTGRES_URL ||
  'postgres://events_migrator:migrator_password@localhost:5432/events'

const BATCH_SIZE = 10_000
const MIGRATION_ID = 'event-audit-backfill'

const ACTION_TYPE_TO_OPERATION: Record<
  string,
  EventActionAuditLog['operation'] | EventCustomActionAuditLog['operation']
> = {
  NOTIFY: 'event.actions.notify.request',
  DECLARE: 'event.actions.declare.request',
  REGISTER: 'event.actions.register.request',
  REJECT: 'event.actions.reject.request',
  VALIDATE: 'event.actions.validate.request',
  EDIT: 'event.actions.edit.request',
  ASSIGN: 'event.actions.assign.request',
  UNASSIGN: 'event.actions.unassign.request',
  READ: 'event.actions.read.request',
  ARCHIVE: 'event.actions.archive.request',
  REINSTATE: 'event.actions.reinstate.request',
  PRINT_CERTIFICATE: 'event.actions.print_certificate.request',
  REQUEST_CORRECTION: 'event.actions.correction.request.request',
  APPROVE_CORRECTION: 'event.actions.correction.approve.request',
  REJECT_CORRECTION: 'event.actions.correction.reject.request',
  MARK_AS_DUPLICATE: 'event.actions.mark_as_duplicate.request',
  MARK_AS_NOT_DUPLICATE: 'event.actions.mark_as_not_duplicate.request',
  CUSTOM: 'event.actions.custom.request'
}

type ActionRow = {
  id: string
  created_by: string
  created_by_user_type: string
  action_type: string
  custom_action_type: string | null
  event_id: string
  action_transaction_id: string
  event_transaction_id: string
  created_at: Date
  created_at_location: string | null
  event_type: string
  tracking_id: string
}

function buildBatchInsertQuery(count: number): string {
  const valueSets = Array.from(
    { length: count },
    (_, i) =>
      `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`
  )
  return `
    INSERT INTO app.audit_log
      (client_id, client_type, operation, request_data, response_summary, created_at, transaction_id)
    VALUES ${valueSets.join(', ')}
  `
}

async function insertBatch(
  client: PoolClient,
  rows: unknown[][]
): Promise<void> {
  if (rows.length === 0) return
  await client.query(buildBatchInsertQuery(rows.length), rows.flat())
}

async function ensureProgressTable(pg: Pool): Promise<void> {
  await pg.query(`
    CREATE TABLE IF NOT EXISTS app.migration_progress (
      id                TEXT    PRIMARY KEY,
      next_batch_offset INTEGER NOT NULL DEFAULT 0,
      completed         BOOLEAN NOT NULL DEFAULT FALSE
    )
  `)
}

async function getProgress(
  pg: Pool
): Promise<{ nextOffset: number; completed: boolean }> {
  const res = await pg.query<{ next_batch_offset: number; completed: boolean }>(
    'SELECT next_batch_offset, completed FROM app.migration_progress WHERE id = $1',
    [MIGRATION_ID]
  )
  if (res.rows.length === 0) {
    await pg.query('INSERT INTO app.migration_progress (id) VALUES ($1)', [
      MIGRATION_ID
    ])
    return { nextOffset: 0, completed: false }
  }
  return {
    nextOffset: res.rows[0].next_batch_offset,
    completed: res.rows[0].completed
  }
}

async function run(pg: Pool): Promise<void> {
  const { nextOffset, completed } = await getProgress(pg)

  if (completed) {
    console.log('Migration already completed — skipping')
    return
  }

  if (nextOffset > 0) {
    console.log(`Resuming from offset ${nextOffset}`)
  }

  let inserted = 0
  let skipped = 0

  for (let offset = nextOffset; ; offset += BATCH_SIZE) {
    const page = await pg.query<ActionRow>(
      `
      SELECT
        ea.id,
        ea.created_by,
        ea.created_by_user_type,
        ea.action_type,
        ea.custom_action_type,
        ea.event_id::text         AS event_id,
        ea.transaction_id         AS action_transaction_id,
        e.transaction_id          AS event_transaction_id,
        ea.created_at,
        ea.created_at_location::text AS created_at_location,
        e.event_type,
        e.tracking_id
      FROM app.event_actions ea
      JOIN app.events e ON e.id = ea.event_id
      WHERE ea.status = 'Accepted'
      ORDER BY ea.id
      LIMIT $1 OFFSET $2
      `,
      [BATCH_SIZE, offset]
    )

    console.log(JSON.stringify(page.rows, null, 2))

    if (page.rows.length === 0) break

    const rowValues: unknown[][] = []

    for (const row of page.rows) {
      if (row.action_type === 'CREATE') {
        const requestData: EventCreateAuditLog['requestData'] = {
          transactionId: row.event_transaction_id,
          type: row.event_type,
          createdAtLocation: row.created_at_location
        }
        const responseSummary: EventCreateAuditLog['responseSummary'] = {
          eventId: row.event_id,
          trackingId: row.tracking_id
        }
        rowValues.push([
          row.created_by,
          row.created_by_user_type,
          'event.create' satisfies EventCreateAuditLog['operation'],
          JSON.stringify(requestData),
          JSON.stringify(responseSummary),
          row.created_at,
          row.event_transaction_id
        ])
        continue
      }

      const operation = ACTION_TYPE_TO_OPERATION[row.action_type]
      if (!operation) {
        skipped++
        continue
      }

      const requestData:
        | EventActionAuditLog['requestData']
        | EventCustomActionAuditLog['requestData'] =
        row.action_type === 'CUSTOM'
          ? {
              eventId: row.event_id,
              actionType: 'CUSTOM',
              customAction: row.custom_action_type ?? '',
              eventType: row.event_type,
              trackingId: row.tracking_id,
              transactionId: row.action_transaction_id
            }
          : {
              eventId: row.event_id,
              actionType: row.action_type,
              eventType: row.event_type,
              trackingId: row.tracking_id,
              transactionId: row.action_transaction_id
            }

      rowValues.push([
        row.created_by,
        row.created_by_user_type,
        operation,
        JSON.stringify(requestData),
        null,
        row.created_at,
        row.action_transaction_id
      ])
    }

    const client = await pg.connect()
    try {
      await client.query('BEGIN')
      await insertBatch(client, rowValues)
      await client.query(
        'UPDATE app.migration_progress SET next_batch_offset = $1 WHERE id = $2',
        [offset + BATCH_SIZE, MIGRATION_ID]
      )
      await client.query('COMMIT')
      inserted += rowValues.length
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }

    console.log(
      `Batch committed: offset ${offset}–${offset + page.rows.length - 1}` +
        ` (${inserted} inserted, ${skipped} skipped so far)`
    )

    if (page.rows.length < BATCH_SIZE) break
  }

  const client = await pg.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      'UPDATE app.migration_progress SET completed = true WHERE id = $1',
      [MIGRATION_ID]
    )
    await client.query('COMMIT')
  } finally {
    client.release()
  }

  console.log(
    `Migration complete: ${inserted} rows inserted, ${skipped} skipped`
  )
}

// node-pg-migrate calls up(pgm) — we ignore pgm and manage our own Pool.
// noTransaction = true prevents node-pg-migrate from wrapping us in a
// transaction, which would block our own batched intermediate commits.
export async function up(_pgm: unknown): Promise<void> {
  const pg = new Pool({ connectionString: EVENTS_POSTGRES_URL })
  try {
    await ensureProgressTable(pg)
    await run(pg)
  } finally {
    await pg.end()
  }
}
;(up as { noTransaction?: boolean }).noTransaction = true

export async function down(_pgm: unknown): Promise<void> {
  // Cannot reliably roll back — cannot distinguish migrated rows from live data
}
