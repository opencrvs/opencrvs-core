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

import { Db, MongoClient } from 'mongodb'
import { Pool, PoolClient } from 'pg'
import { query as influxQuery } from '../../utils/influx-helper.js'

const EVENTS_POSTGRES_URL =
  process.env.EVENTS_POSTGRES_URL ||
  'postgres://events_migrator:migrator_password@localhost:5432/events'

const BATCH_SIZE = 500
const MIGRATION_ID = 'influx-user-audit-to-postgres'

/** Maps legacy InfluxDB user-management action names to v2 operation strings. */
const USER_ACTION_TO_OPERATION: Record<string, string> = {
  LOGGED_IN: 'user.logged_in',
  LOGGED_OUT: 'user.logged_out',
  CREATE_USER: 'user.create_user',
  EDIT_USER: 'user.edit_user',
  PASSWORD_CHANGED: 'user.password_changed',
  PASSWORD_RESET: 'user.password_reset',
  PASSWORD_RESET_BY_ADMIN: 'user.password_reset_by_admin',
  PHONE_NUMBER_CHANGED: 'user.phone_number_changed',
  EMAIL_ADDRESS_CHANGED: 'user.email_address_changed',
  USERNAME_REMINDER: 'user.username_reminder',
  USERNAME_REMINDER_BY_ADMIN: 'user.username_reminder_by_admin',
  DEACTIVATE: 'user.deactivate',
  REACTIVATE: 'user.reactivate'
}

/**
 * Maps legacy InfluxDB event-action names (written by createUserAuditPointFromFHIR)
 * to v2 event action operation strings.
 */
const EVENT_ACTION_TO_OPERATION: Record<string, string> = {
  IN_PROGRESS: 'event.actions.notify.request',
  DECLARED: 'event.actions.declare.request',
  REGISTERED: 'event.actions.register.request',
  REJECTED: 'event.actions.reject.request',
  CORRECTED: 'event.actions.correction.approve.request',
  REQUESTED_CORRECTION: 'event.actions.correction.request.request',
  APPROVED_CORRECTION: 'event.actions.correction.approve.request',
  REJECTED_CORRECTION: 'event.actions.correction.reject.request',
  VALIDATED: 'event.actions.validate.request',
  DECLARATION_UPDATED: 'event.actions.edit.request',
  ASSIGNED: 'event.actions.assign.request',
  UNASSIGNED: 'event.actions.unassign.request',
  RETRIEVED: 'event.actions.read.request',
  VIEWED: 'event.actions.read.request',
  ARCHIVED: 'event.actions.archive.request',
  REINSTATED_IN_PROGRESS: 'event.actions.reinstate.request',
  REINSTATED_DECLARED: 'event.actions.reinstate.request',
  REINSTATED_REJECTED: 'event.actions.reinstate.request',
  SENT_FOR_APPROVAL: 'event.actions.validate.request',
  CERTIFIED: 'event.actions.print_certificate.request',
  ISSUED: 'event.actions.print_certificate.request',
  MARKED_AS_DUPLICATE: 'event.actions.mark_as_duplicate.request',
  MARKED_AS_NOT_DUPLICATE: 'event.actions.mark_as_not_duplicate.request'
}

const ALL_ACTION_TO_OPERATION: Record<string, string> = {
  ...USER_ACTION_TO_OPERATION,
  ...EVENT_ACTION_TO_OPERATION
}

const EVENT_ACTIONS = new Set(Object.keys(EVENT_ACTION_TO_OPERATION))

/**
 * Admin actions where the actor (practitionerId) is different from the
 * subject (subjectPractitionerId stored in the data field).
 */
const ADMIN_ACTIONS = new Set([
  'CREATE_USER',
  'EDIT_USER',
  'PASSWORD_RESET_BY_ADMIN',
  'DEACTIVATE',
  'REACTIVATE',
  'USERNAME_REMINDER_BY_ADMIN'
])

type InfluxRow = {
  time: Date
  action: string
  practitionerId: string
  data: string | null
}

type ParsedData = {
  // User-management fields
  subjectPractitionerId?: string
  role?: string
  primaryOfficeId?: string
  reason?: string
  comment?: string
  email?: string
  phoneNumber?: string
  // Event-action fields (written by createUserAuditPointFromFHIR)
  compositionId?: string
  trackingId?: string
}

function parseData(raw: string | null): ParsedData {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as ParsedData
  } catch {
    return {}
  }
}

function buildRequestData(
  action: string,
  subjectId: string,
  data: ParsedData
): Record<string, unknown> {
  if (EVENT_ACTIONS.has(action)) {
    return {
      eventId: data.compositionId ?? '',
      actionType: action,
      transactionId: data.trackingId ?? ''
    }
  }
  switch (action) {
    case 'CREATE_USER':
      return {
        subjectId,
        role: data.role ?? '',
        primaryOfficeId: data.primaryOfficeId ?? ''
      }
    case 'DEACTIVATE':
    case 'REACTIVATE': {
      const rd: Record<string, unknown> = {
        subjectId,
        reason: data.reason ?? ''
      }
      if (data.comment !== undefined) rd.comment = data.comment
      return rd
    }
    default:
      return { subjectId }
  }
}

function buildResponseSummary(
  action: string,
  data: ParsedData
): Record<string, unknown> {
  switch (action) {
    case 'EMAIL_ADDRESS_CHANGED':
      return { email: data.email ?? '' }
    case 'PHONE_NUMBER_CHANGED':
      return { phoneNumber: data.phoneNumber ?? '' }
    default:
      return {}
  }
}

type InsertRow = {
  clientId: string
  operation: string
  requestData: Record<string, unknown>
  responseSummary: Record<string, unknown>
  createdAt: Date
}

function buildBatchInsertQuery(count: number): string {
  const valueSets = Array.from(
    { length: count },
    (_, i) =>
      `($${i * 5 + 1}, 'user', $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
  )
  return `INSERT INTO app.audit_log
            (client_id, client_type, operation, request_data, response_summary, created_at)
          VALUES ${valueSets.join(', ')}`
}

async function insertBatch(
  client: PoolClient,
  rows: InsertRow[]
): Promise<void> {
  if (rows.length === 0) return
  const values = rows.flatMap((r) => [
    r.clientId,
    r.operation,
    JSON.stringify(r.requestData),
    JSON.stringify(r.responseSummary),
    r.createdAt
  ])
  await client.query(buildBatchInsertQuery(rows.length), values)
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

export const up = async (db: Db, _client: MongoClient) => {
  let rows: InfluxRow[]
  try {
    const actionFilter = Object.keys(ALL_ACTION_TO_OPERATION)
      .map((a) => `action = '${a}'`)
      .join(' OR ')
    rows = (await influxQuery(
      `SELECT * FROM user_audit_event WHERE ${actionFilter}`
    )) as InfluxRow[]
  } catch (err) {
    console.log(
      'Could not read user_audit_event from InfluxDB (measurement may not exist):',
      (err as Error).message
    )
    return
  }

  if (!rows || rows.length === 0) {
    console.log('No user_audit_event rows in InfluxDB — nothing to migrate')
    return
  }

  console.log(`Found ${rows.length} user audit events in InfluxDB to migrate`)

  // Collect all practitioner IDs for a single bulk MongoDB lookup.
  const practitionerIds = new Set<string>()
  for (const row of rows) {
    if (row.practitionerId && row.practitionerId !== 'undefined') {
      practitionerIds.add(row.practitionerId)
    }
    const parsed = parseData(row.data)
    if (parsed.subjectPractitionerId) {
      practitionerIds.add(parsed.subjectPractitionerId)
    }
  }

  const userDocs = await db
    .collection('users')
    .find({ practitionerId: { $in: [...practitionerIds] } })
    .project<{ _id: unknown; practitionerId: string }>({
      _id: 1,
      practitionerId: 1
    })
    .toArray()

  const practitionerToUserId = new Map<string, string>(
    userDocs.map((u) => [u.practitionerId, String(u._id)])
  )

  // Sort by time so offset-based progress tracking is stable across restarts.
  rows.sort((a, b) => a.time.getTime() - b.time.getTime())

  const pg = new Pool({ connectionString: EVENTS_POSTGRES_URL })
  try {
    await ensureProgressTable(pg)
    const { nextOffset, completed } = await getProgress(pg)

    if (completed) {
      console.log('Migration already completed — skipping')
      return
    }

    if (nextOffset > 0) {
      console.log(
        `Resuming from offset ${nextOffset} (${rows.length - nextOffset} rows remaining)`
      )
    }

    let inserted = 0
    let skipped = 0

    for (let offset = nextOffset; offset < rows.length; offset += BATCH_SIZE) {
      const batchRows = rows.slice(offset, offset + BATCH_SIZE)
      const insertRows: InsertRow[] = []

      for (const row of batchRows) {
        const operation = ALL_ACTION_TO_OPERATION[row.action]
        if (!operation) {
          skipped++
          continue
        }

        const rawPractitionerId =
          row.practitionerId === 'undefined' ? '' : row.practitionerId
        const actorUserId = rawPractitionerId
          ? (practitionerToUserId.get(rawPractitionerId) ?? rawPractitionerId)
          : ''

        const parsed = parseData(row.data)

        let subjectId = actorUserId
        if (ADMIN_ACTIONS.has(row.action) && parsed.subjectPractitionerId) {
          subjectId =
            practitionerToUserId.get(parsed.subjectPractitionerId) ??
            parsed.subjectPractitionerId
        }

        insertRows.push({
          clientId: actorUserId,
          operation,
          requestData: buildRequestData(row.action, subjectId, parsed),
          responseSummary: buildResponseSummary(row.action, parsed),
          createdAt: row.time
        })
      }

      const pgClient = await pg.connect()
      try {
        await pgClient.query('BEGIN')
        await insertBatch(pgClient, insertRows)
        // Advance progress within the same transaction so a mid-batch failure
        // rolls back both the inserts and the progress update together.
        await pgClient.query(
          'UPDATE app.migration_progress SET next_batch_offset = $1 WHERE id = $2',
          [Math.min(offset + BATCH_SIZE, rows.length), MIGRATION_ID]
        )
        await pgClient.query('COMMIT')
        inserted += insertRows.length
      } catch (err) {
        await pgClient.query('ROLLBACK')
        throw err
      } finally {
        pgClient.release()
      }

      console.log(
        `Batch committed: rows ${offset}–${Math.min(offset + BATCH_SIZE, rows.length) - 1}` +
          ` (${inserted} inserted so far)`
      )
    }

    // Mark migration as fully complete.
    const finalClient = await pg.connect()
    try {
      await finalClient.query('BEGIN')
      await finalClient.query(
        'UPDATE app.migration_progress SET completed = true WHERE id = $1',
        [MIGRATION_ID]
      )
      await finalClient.query('COMMIT')
    } finally {
      finalClient.release()
    }

    console.log(
      `Migration complete: ${inserted} rows inserted, ${skipped} skipped`
    )
  } finally {
    await pg.end()
  }
}

export const down = async (_db: Db, _client: MongoClient) => {
  // Cannot reliably rollback — cannot distinguish migrated rows from live data
}
