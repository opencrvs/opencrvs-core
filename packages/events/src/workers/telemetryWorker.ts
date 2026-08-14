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
 * `reported_at` of the most recent report handed to countryconfig. While it
 * equals today's window we skip; a failed attempt leaves it unchanged so the
 * next poll retries. Reset on restart — a retry then reuses the same stable
 * `reported_at`, which the status service idempotency key collapses.
 */
let lastReportedAt: string | undefined

async function runTelemetryTick(): Promise<void> {
  const reportedAt = startOfUtcDay()
  if (reportedAt === lastReportedAt) {
    return
  }
  const result = await runDailyTelemetry(reportedAt)

  // `sent` means countryconfig accepted the report (whether it forwarded it or
  // skipped because telemetry is disabled); the day is covered. Anything else
  // leaves lastReportedAt unset so the next tick retries.
  if (result.status === 'sent') {
    lastReportedAt = reportedAt
  }
}

export function startTelemetryWorker(): void {
  // The worker always runs; whether a report is forwarded to the status service
  // is decided by countryconfig, so the events service stays unaware of whether
  // telemetry is enabled.
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
