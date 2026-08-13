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

import { logger } from '@opencrvs/commons'
import { runDailyTelemetry, startOfUtcDay } from '@events/service/telemetry'

/**
 * How often the worker wakes up to check whether today's report has been sent.
 * The report itself is sent at most once per UTC day; polling hourly means a
 * failed attempt is retried within the hour without a dedicated scheduler, and
 * a service that restarts mid-day still reports that day.
 */
const TELEMETRY_POLL_INTERVAL_MS = 60 * 60 * 1000

/**
 * `reported_at` of the most recent successful send. While it equals today's
 * window we skip sending; a failed attempt leaves it unchanged so the next
 * poll retries. Reset on restart — a retry then hits the server's idempotency
 * key and returns a harmless `200 duplicate`.
 */
let lastReportedAt: string | undefined

async function runTelemetryTick(): Promise<void> {
  const reportedAt = startOfUtcDay()
  if (reportedAt === lastReportedAt) {
    return
  }
  const result = await runDailyTelemetry(reportedAt)

  // `accepted` and `duplicate` both mean the day is covered; anything else
  // leaves lastReportedAt unset so the next tick retries.
  if (result.status === 'accepted' || result.status === 'duplicate') {
    lastReportedAt = reportedAt
  }
}

export function startTelemetryWorker(): void {
  // The worker always runs; whether a report is actually sent is decided per
  // tick from the application config (TELEMETRY_ENABLED), so toggling telemetry
  // in countryconfig takes effect without restarting the events service.
  const tick = () =>
    runTelemetryTick().catch((err) => {
      logger.error(
        `Telemetry worker: unhandled error in tick: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
    })

  logger.info('Telemetry worker: started')
  void tick()
  setInterval(tick, TELEMETRY_POLL_INTERVAL_MS)
}
