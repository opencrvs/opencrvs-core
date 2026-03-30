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
import { Pool } from 'pg'
import { query as influxQuery } from '../../utils/influx-helper.js'

const EVENTS_POSTGRES_URL =
  process.env.EVENTS_POSTGRES_URL ||
  'postgres://events_app:app_password@localhost:5432/events'

/** Maps legacy v1 InfluxDB action names to new v2 operation names. */
const ACTION_TO_OPERATION: Record<string, string> = {
  LOGGED_IN: 'user.LOGGED_IN',
  LOGGED_OUT: 'user.LOGGED_OUT',
  CREATE_USER: 'user.CREATE_USER',
  EDIT_USER: 'user.EDIT_USER',
  PASSWORD_CHANGED: 'user.PASSWORD_CHANGED',
  PASSWORD_RESET: 'user.PASSWORD_RESET',
  PASSWORD_RESET_BY_ADMIN: 'user.PASSWORD_RESET_BY_ADMIN',
  PHONE_NUMBER_CHANGED: 'user.PHONE_NUMBER_CHANGED',
  EMAIL_ADDRESS_CHANGED: 'user.EMAIL_ADDRESS_CHANGED',
  USERNAME_REMINDER: 'user.USERNAME_REMINDER',
  USERNAME_REMINDER_BY_ADMIN: 'user.USERNAME_REMINDER_BY_ADMIN',
  DEACTIVATE: 'user.DEACTIVATE',
  REACTIVATE: 'user.REACTIVATE'
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

export const up = async (db: Db, _client: MongoClient) => {
  let rows: InfluxRow[]
  try {
    const actionFilter = Object.keys(ACTION_TO_OPERATION)
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

  // Collect all practitioner IDs so we can bulk-look up user IDs from MongoDB.
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

  // Build practitionerId → MongoDB _id lookup map.
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

  const pg = new Pool({ connectionString: EVENTS_POSTGRES_URL })

  try {
    await pg.query('BEGIN')

    let inserted = 0
    let skipped = 0

    for (const row of rows) {
      const operation = ACTION_TO_OPERATION[row.action]
      if (!operation) {
        console.log(`Skipping unknown action: ${row.action}`)
        skipped++
        continue
      }

      // Resolve actor userId. Treat the string "undefined" as missing.
      const rawPractitionerId =
        row.practitionerId === 'undefined' ? '' : row.practitionerId
      const actorUserId = rawPractitionerId
        ? (practitionerToUserId.get(rawPractitionerId) ?? rawPractitionerId)
        : ''

      const parsed = parseData(row.data)

      // Resolve subjectId: for admin actions use subjectPractitionerId from the
      // data field; for self-service actions the subject is the actor.
      let subjectId = actorUserId ?? ''
      if (ADMIN_ACTIONS.has(row.action) && parsed.subjectPractitionerId) {
        subjectId =
          practitionerToUserId.get(parsed.subjectPractitionerId) ??
          parsed.subjectPractitionerId
      }

      const requestData = buildRequestData(row.action, subjectId, parsed)
      const responseSummary = buildResponseSummary(row.action, parsed)

      await pg.query(
        `INSERT INTO app.audit_log
           (client_id, client_type, operation, request_data, response_summary, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          actorUserId,
          'user',
          operation,
          JSON.stringify(requestData),
          JSON.stringify(responseSummary),
          row.time
        ]
      )
      inserted++
    }

    await pg.query('COMMIT')
    console.log(
      `Migration complete: ${inserted} rows inserted, ${skipped} skipped`
    )
  } catch (err) {
    await pg.query('ROLLBACK')
    throw err
  } finally {
    await pg.end()
  }
}

export const down = async (_db: Db, _client: MongoClient) => {
  // We can not reliably rollback this migration
  // because we can not detect which rows came from influxdb
}
