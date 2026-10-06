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
import { Kysely, PostgresDialect, sql } from 'kysely'
import { Pool } from 'pg'
import { getPool } from './events'

// https://github.com/opencrvs/opencrvs-core/issues/13904
// Before pg 8.22 / pg-protocol 1.15, a parameter that threw during
// serialisation wedged its client, which Kysely then released back to the
// pool, and left half a Bind message in the process-wide write buffer for the
// next query on any client to inherit.
test('a parameter that cannot be serialised fails only its own query', async () => {
  const pool = new Pool({
    connectionString: getPool().options.connectionString,
    max: 2
  })
  const db = new Kysely<object>({ dialect: new PostgresDialect({ pool }) })
  const selectNumber = async (n: number) =>
    (await sql<{ n: number }>`select ${n}::int as n`.execute(db)).rows[0].n

  try {
    // Open both connections up front, so the follow-up queries cover the
    // client that ran the bad query as well as one that did not.
    await Promise.all([selectNumber(0), selectNumber(0)])

    const circular: Record<string, unknown> = {}
    circular.self = circular
    await expect(sql`select ${circular}::jsonb`.execute(db)).rejects.toThrow(
      /circular structure/
    )

    await expect(
      Promise.all([selectNumber(1), selectNumber(2)])
    ).resolves.toEqual([1, 2])
  } finally {
    await db.destroy()
  }
}, 10_000)
