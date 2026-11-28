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
import { getPool } from '@events/storage/postgres/events'

/*
 * Postgres keeps a session-level advisory lock until the connection unlocks it
 * or closes. If the job process dies, the connection closes and Postgres
 * releases the lock, so a crashed reindex does not block the next one.
 */
const REINDEX_LOCK_KEY = 7_340_101

export class ReindexAlreadyRunningError extends Error {
  constructor() {
    super(
      'Another reindex is running. Wait for it to complete, then start the reindex again.'
    )
    this.name = 'ReindexAlreadyRunningError'
  }
}

export async function withReindexLock<T>(fn: () => Promise<T>): Promise<T> {
  const connection = await getPool().connect()
  try {
    const { rows } = await connection.query<{ locked: boolean }>(
      'SELECT pg_try_advisory_lock($1) AS locked',
      [REINDEX_LOCK_KEY]
    )

    if (!rows[0]?.locked) {
      throw new ReindexAlreadyRunningError()
    }

    try {
      return await fn()
    } finally {
      await connection.query('SELECT pg_advisory_unlock($1)', [
        REINDEX_LOCK_KEY
      ])
    }
  } finally {
    connection.release()
  }
}
