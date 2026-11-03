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
import { logger, UUID } from '@opencrvs/commons'
import { getLockPool } from '@events/storage/postgres/events'

/**
 * First key of the two-key advisory lock, so that these locks cannot collide with
 * advisory locks taken for any other purpose.
 */
const ACTION_REQUEST_LOCK_NAMESPACE = 13901

/**
 * Runs `fn` while holding a Postgres advisory lock for the event, or returns
 * `{ acquired: false }` straight away if another holder has it.
 *
 * The lock is held by a database session rather than stored in a table, so it exists
 * only while the holder is running: it is released when `fn` settles, and by Postgres
 * when the connection closes, so a crashed request never leaves it behind.
 */
export async function withEventLock<T>(
  eventId: UUID,
  fn: () => Promise<T>
): Promise<{ acquired: false } | { acquired: true; result: T }> {
  const client = await getLockPool().connect()
  let releaseError: Error | undefined

  try {
    const { rows } = await client.query<{ acquired: boolean }>(
      'SELECT pg_try_advisory_lock($1, hashtext($2)) AS acquired',
      [ACTION_REQUEST_LOCK_NAMESPACE, eventId]
    )

    if (!rows[0].acquired) {
      return { acquired: false }
    }

    try {
      return { acquired: true, result: await fn() }
    } finally {
      try {
        await client.query('SELECT pg_advisory_unlock($1, hashtext($2))', [
          ACTION_REQUEST_LOCK_NAMESPACE,
          eventId
        ])
      } catch (error) {
        // Destroying the connection below ends the session, which releases the lock.
        releaseError = error as Error
        logger.error(
          { eventId, error },
          'Failed to release the event lock, closing its connection'
        )
      }
    }
  } finally {
    client.release(releaseError)
  }
}
