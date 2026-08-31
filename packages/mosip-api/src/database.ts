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
import DatabaseSync, { Database } from 'better-sqlite3'
import { decode } from 'jsonwebtoken'

/*
 * Lightweight SQLite database correlating a MOSIP transaction id back to the
 * OpenCRVS event it registers.
 *
 * When the credential is later issued, MOSIP echoes the transaction id (and
 * nothing else) on the WebSub callback, so mosip-api has to persist the
 * OpenCRVS `eventId` and registration number here to be able to confirm the
 * registration. The confirmation itself authenticates with this integration's
 * own client credentials, so no token is stored.
 *
 * Optimally, MOSIP could carry this metadata and return it back in WebSub to
 * avoid storage, but this is not currently supported by MOSIP.
 */

const DATABASE_SCHEMA = `
  CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  ) STRICT
`

let database: Database

const tableColumns = (name: string): string[] =>
  (
    database.prepare(`PRAGMA table_info(${name})`).all() as Array<{
      name: string
    }>
  ).map((column) => column.name)

/**
 * Migrates the legacy `transactions` table (which stored the exchanged
 * confirmation `token`) to the current schema. The OpenCRVS `eventId` is
 * recovered from the token payload so in-flight transactions survive the
 * upgrade. Rows whose token can no longer be decoded are dropped.
 */
const migrateLegacyTokenSchema = () => {
  const legacyRows = database
    .prepare('SELECT id, token, registration_number FROM transactions')
    .all() as Array<{ id: string; token: string; registration_number: string }>

  database.exec('ALTER TABLE transactions RENAME TO transactions_legacy')
  database.exec(DATABASE_SCHEMA)

  const insert = database.prepare(
    'INSERT INTO transactions (id, event_id, registration_number) VALUES (?, ?, ?)'
  )

  for (const row of legacyRows) {
    const payload = decode(row.token) as { eventId?: string } | null
    if (!payload?.eventId) {
      continue
    }
    insert.run(row.id, payload.eventId, row.registration_number)
  }

  database.exec('DROP TABLE transactions_legacy')
}

export const initSqlite = (path: string) => {
  database = new DatabaseSync(path)

  const tableExists = database
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'"
    )
    .get()

  if (!tableExists) {
    database.exec(DATABASE_SCHEMA)
  } else if (!tableColumns('transactions').includes('event_id')) {
    migrateLegacyTokenSchema()
  }

  return { wasCreated: !tableExists, wasConnected: tableExists, database }
}

export const insertTransaction = (
  id: string,
  eventId: string,
  registrationNumber: string
) =>
  database
    .prepare(
      'INSERT INTO transactions (id, event_id, registration_number) VALUES (?, ?, ?)'
    )
    .run(id, eventId, registrationNumber)

export const getTransactionAndDiscard = (id: string) => {
  const remove = database
    .prepare(
      'DELETE FROM transactions WHERE id = ? RETURNING event_id, registration_number'
    )
    .get(id) as { event_id: string; registration_number: string } | undefined

  if (!remove) {
    throw new Error(`Transaction with id '${id}' not found.`)
  }

  return {
    eventId: remove.event_id,
    registrationNumber: remove.registration_number
  }
}

/**
 * Retrieves all transactions from the database.
 *
 * @warning
 * This function is intended for **debugging purposes only** as it exposes sensitive data.
 */
export const getAllTransactions = () => {
  return database
    .prepare(
      'SELECT id, event_id, registration_number, created_at FROM transactions'
    )
    .all() as Array<{
    id: string
    event_id: string
    registration_number: string
    created_at: string
  }>
}

export const exit = () => database.close()
