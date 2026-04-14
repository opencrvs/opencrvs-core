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

import type { UserAuditLog } from '@opencrvs/commons/events'
import { Db, MongoClient } from 'mongodb'
import { Pool, PoolClient } from 'pg'
import { query as influxQuery } from '../../utils/influx-helper.js'

const EVENTS_POSTGRES_URL =
  process.env.EVENTS_POSTGRES_URL ||
  'postgres://events_migrator:migrator_password@localhost:5432/events'

const USER_ACTION_TO_OPERATION: Record<string, UserAuditLog['operation']> = {
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
  subjectPractitionerId?: string
  role?: string
  primaryOfficeId?: string
  reason?: string
  comment?: string
  email?: string
  phoneNumber?: string
}

function parseData(raw: string | null): ParsedData {
  if (!raw) return {}
  try {
    return JSON.parse(raw) satisfies ParsedData
  } catch {
    return {}
  }
}

type InsertRow = {
  clientId: string
  createdAt: Date
} & UserAuditLog

function buildUserRow(
  row: InfluxRow,
  actorUserId: string,
  subjectId: string,
  data: ParsedData,
  operation: UserAuditLog['operation']
): InsertRow {
  const clientId = actorUserId
  const createdAt = row.time
  switch (operation) {
    case 'user.create_user':
      return {
        clientId,
        createdAt,
        operation,
        requestData: {
          subjectId,
          role: data.role ?? '',
          primaryOfficeId: data.primaryOfficeId ?? ''
        }
      } satisfies InsertRow
    case 'user.deactivate':
    case 'user.reactivate': {
      const requestData: {
        subjectId: string
        reason: string
        comment?: string
      } = { subjectId, reason: data.reason ?? '' }
      if (data.comment !== undefined) requestData.comment = data.comment
      return { clientId, createdAt, operation, requestData } satisfies InsertRow
    }
    case 'user.email_address_changed':
      return {
        clientId,
        createdAt,
        operation,
        requestData: { subjectId },
        responseSummary: { email: data.email ?? '' }
      }
    case 'user.phone_number_changed':
      return {
        clientId,
        createdAt,
        operation,
        requestData: { subjectId },
        responseSummary: { phoneNumber: data.phoneNumber ?? '' }
      }
    default:
      return {
        clientId,
        createdAt,
        operation,
        requestData: { subjectId }
      } satisfies InsertRow
  }
}

function buildInsertQuery(count: number): string {
  const valueSets = Array.from(
    { length: count },
    (_, i) =>
      `($${i * 5 + 1}, 'user', $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
  )
  return `INSERT INTO app.audit_log
            (client_id, client_type, operation, request_data, response_summary, created_at)
          VALUES ${valueSets.join(', ')}`
}

async function insertAll(client: PoolClient, rows: InsertRow[]): Promise<void> {
  if (rows.length === 0) return
  const values = rows.flatMap((r) => [
    r.clientId,
    r.operation,
    JSON.stringify(r.requestData),
    'responseSummary' in r ? JSON.stringify(r.responseSummary) : '{}',
    r.createdAt
  ])
  await client.query(buildInsertQuery(rows.length), values)
}

export const up = async (db: Db, _client: MongoClient) => {
  const actionFilter = Object.keys(USER_ACTION_TO_OPERATION)
    .map((a) => `action = '${a}'`)
    .join(' OR ')

  const allUserDocs = await db
    .collection('users')
    .find({})
    .project<{ _id: unknown; practitionerId: string }>({
      _id: 1,
      practitionerId: 1
    })
    .toArray()

  const practitionerToUserId = new Map<string, string>(
    allUserDocs
      .filter((u) => u.practitionerId)
      .map((u) => [u.practitionerId, String(u._id)])
  )

  console.log(
    `Loaded ${practitionerToUserId.size} users from MongoDB for ID resolution`
  )

  let rows: InfluxRow[]
  try {
    rows = (await influxQuery(
      `SELECT * FROM user_audit_event WHERE ${actionFilter} ORDER BY time ASC`
    )) as InfluxRow[]
  } catch (err) {
    console.log(
      'Could not read user_audit_event from InfluxDB (measurement may not exist):',
      (err as Error).message
    )
    return
  }

  if (!rows || rows.length === 0) {
    console.log('No user audit events found in InfluxDB — skipping')
    return
  }

  let skipped = 0
  const insertRows: InsertRow[] = []

  for (const row of rows) {
    const operation = USER_ACTION_TO_OPERATION[row.action]
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

    insertRows.push(
      buildUserRow(row, actorUserId, subjectId, parsed, operation)
    )
  }

  const pg = new Pool({ connectionString: EVENTS_POSTGRES_URL })
  try {
    const pgClient = await pg.connect()
    try {
      await pgClient.query('BEGIN')
      await insertAll(pgClient, insertRows)
      await pgClient.query('COMMIT')
    } catch (err) {
      await pgClient.query('ROLLBACK')
      throw err
    } finally {
      pgClient.release()
    }
  } finally {
    await pg.end()
  }

  console.log(
    `Migration complete: ${insertRows.length} rows inserted, ${skipped} skipped`
  )
}

export const down = async (_db: Db, _client: MongoClient) => {
  // Cannot reliably rollback — cannot distinguish migrated rows from live data
}
