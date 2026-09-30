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

import fetch from 'node-fetch'
import { logger } from '@opencrvs/commons'
import { env } from '@events/environment'
import { getIntegrationCreatorToken } from '@events/service/auth'

const MAX_ATTEMPTS = 10
const INITIAL_DELAY_MS = 1000
const MAX_DELAY_MS = 30000
/**
 * A peer that accepts the connection but never answers must not hang the loop.
 * This bounds every request an attempt makes, not just the trigger itself: an
 * unbounded call anywhere in `attemptSystemReady` stalls the retry loop on its
 * first attempt, and nothing is logged until an attempt settles.
 */
const REQUEST_TIMEOUT_MS = 5000

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function attemptSystemReady() {
  // The bootstrap token lives 60 seconds, which is shorter than the retry
  // window, so it is minted per attempt rather than once up front
  const bootstrapToken = await getIntegrationCreatorToken(REQUEST_TIMEOUT_MS)
  const res = await fetch(
    new URL('/trigger/system/ready', env.COUNTRY_CONFIG_URL).toString(),
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${bootstrapToken}` },
      timeout: REQUEST_TIMEOUT_MS
    }
  )

  // 404 and 501 mean the country config does not implement the trigger. That
  // is a valid configuration, not a failure worth retrying.
  if (res.status === 404 || res.status === 501) {
    logger.info(
      `system/ready trigger not implemented by country config (${res.status}), skipping`
    )
    return
  }

  if (!res.ok) {
    throw new Error(`trigger returned ${res.status}: ${await res.text()}`)
  }
}

/**
 * Asks the country config to register its integrations.
 *
 * Events and the country config start concurrently, so the country config may
 * not be listening yet when this first runs. The retry exists because that
 * failure is otherwise silent and sticky: nothing tries again until events is
 * restarted, and an orchestrator sees a healthy process, so an integration
 * declared by the country config simply never gets registered. The symptom
 * surfaces far from the cause — e.g. MOSIP cannot authenticate as itself, so
 * its actions are attributed to the registrar in the audit trail.
 */
export async function triggerSystemReady() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await attemptSystemReady()
      return
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      if (attempt === MAX_ATTEMPTS) {
        logger.error(
          `system/ready trigger failed after ${attempt} attempts: ${message}. Integrations declared by the country config may not be registered.`
        )
        return
      }

      const backoffMs = Math.min(
        INITIAL_DELAY_MS * 2 ** (attempt - 1),
        MAX_DELAY_MS
      )

      logger.warn(
        `system/ready trigger attempt ${attempt} failed: ${message}. Retrying in ${backoffMs}ms`
      )

      await delay(backoffMs)
    }
  }
}
