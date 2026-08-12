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

import { expect, test } from '@playwright/test'
import {
  AUTH_URL,
  CREDENTIALS,
  GATEWAY_HOST,
  TEST_USER_PASSWORD
} from '../../constants'
import { getToken } from '../../helpers'

const EVENTS_URL = `${GATEWAY_HOST}/events/events`

/** How often (ms) to poll the status endpoint */
const POLL_INTERVAL_MS = 3_000
/** Maximum time (ms) to wait for reindex to complete (3 minutes) */
const MAX_WAIT_MS = 3 * 60 * 1000

/**
 * POST /events/reindex — triggers a new reindex run.
 * The request may take a long time; we fire it and track via polling.
 */
async function triggerReindex(token: string): Promise<void> {
  const res = await fetch(`${EVENTS_URL}/reindex`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ waitForCompletion: false })
  })

  // The trigger returns immediately; progress is tracked via polling the GET endpoint.
  expect(res.status).toBeLessThan(500)
}

interface ReindexStatus {
  timestamp: string
  status: 'running' | 'completed' | 'failed'
  progress: { processed: number }
  error_message?: string
}

/**
 * GET /events/reindex — returns an array of reindex status documents.
 * Filters to the most recent run whose timestamp >= `since`.
 */
async function fetchLatestRunSince(
  token: string,
  since: string
): Promise<ReindexStatus | null> {
  const res = await fetch(`${EVENTS_URL}/reindex`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  expect(res.ok).toBe(true)

  const runs: ReindexStatus[] = await res.json()

  // Truncate to 19 chars (YYYY-MM-DDTHH:MM:SS) to avoid
  // the '.' < 'Z' string-sort trap with millisecond timestamps,
  // matching the approach in reindex.sh
  const sinceTruncated = since.slice(0, 19)

  const matching = runs
    .filter((r) => r.timestamp.slice(0, 19) >= sinceTruncated)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  return matching[0] ?? null
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

test.describe('Events reindex API', () => {
  // Reindexing can take a while; use a generous timeout
  test.setTimeout(MAX_WAIT_MS + 30_000)

  let token: string

  test.beforeAll(async () => {
    token = await getToken(
      CREDENTIALS.NATIONAL_SYSTEM_ADMIN,
      TEST_USER_PASSWORD
    )
  })

  test('Trigger reindex and track until completion', async () => {
    // Capture wall-clock time BEFORE triggering so it is always
    // earlier than the status document the server writes
    const triggerTime = new Date().toISOString().slice(0, 19)

    await triggerReindex(token)

    // Poll until the reindex completes or fails
    const deadline = Date.now() + MAX_WAIT_MS
    let firstPoll = true

    while (Date.now() < deadline) {
      // Short initial wait, then regular interval
      await sleep(firstPoll ? 3_000 : POLL_INTERVAL_MS)
      firstPoll = false

      const run = await fetchLatestRunSince(token, triggerTime)

      if (!run) {
        // Reindex hasn't started producing status docs yet
        continue
      }

      if (run.status === 'completed') {
        expect(run.progress.processed).toBeGreaterThanOrEqual(0)
        return // ✅ success
      }

      if (run.status === 'failed') {
        throw new Error(
          `Reindex failed: ${run.error_message ?? 'unknown error'}`
        )
      }

      // status === 'running' — keep polling
      expect(run.status).toBe('running')
    }

    throw new Error(
      `Reindex did not complete within ${MAX_WAIT_MS / 1000} seconds`
    )
  })
})
