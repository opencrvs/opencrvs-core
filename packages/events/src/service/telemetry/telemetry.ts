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

import { logger, joinUrl } from '@opencrvs/commons'
import { env } from '@events/environment'
import { getServiceToken } from '@events/service/auth'
import { collectTelemetryMetrics, TelemetryMetrics } from './metrics'

/** Metrics map size limits enforced by the telemetry ingest endpoint. */
const MIN_METRICS = 1
const MAX_METRICS = 500

/**
 * Report the events service sends to countryconfig's `/trigger/telemetry`.
 * countryconfig decides whether telemetry is enabled, stamps the instance
 * identity (country code, domain, environment, application name) and forwards
 * it to the status service — so core stays unaware of any of that.
 */
export interface TelemetryReport {
  reported_at: string
  app_version?: string
  metrics: TelemetryMetrics
}

export type TelemetrySendResult =
  | { status: 'sent' }
  | { status: 'skipped'; reason: string }
  | { status: 'error'; httpStatus?: number; message: string }

/**
 * Midnight (UTC) of the given day as an ISO 8601 string. Used as `reported_at`
 * so that retries — and restarts — within the same day resolve to the same
 * value. The status service's idempotency key then collapses duplicate sends to
 * a single report, keeping at-most-once daily reporting from double-counting.
 */
export function startOfUtcDay(date: Date = new Date()): string {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

export function buildTelemetryReport(
  metrics: TelemetryMetrics,
  reportedAt: string
): TelemetryReport {
  return {
    reported_at: reportedAt,
    // Set by the package manager when the service is started via a script.
    app_version: process.env.npm_package_version,
    metrics
  }
}

/**
 * POSTs a report to countryconfig's telemetry trigger. The `authorization`
 * header is an OpenCRVS bearer token (issued by the auth service); countryconfig
 * verifies it with the auth public key it fetches on startup, proving the report
 * came from a legitimate core service. Network and server errors are returned
 * rather than thrown so the caller (the daily worker) can decide whether to
 * retry — the stable `reported_at` makes a retry safe.
 */
export async function sendTelemetryReport(
  report: TelemetryReport,
  authorization: string
): Promise<TelemetrySendResult> {
  const entries = Object.keys(report.metrics).length
  if (entries < MIN_METRICS || entries > MAX_METRICS) {
    return {
      status: 'skipped',
      reason: `metrics count ${entries} outside allowed range ${MIN_METRICS}-${MAX_METRICS}`
    }
  }

  let response: Response
  try {
    response = await fetch(
      joinUrl(env.COUNTRY_CONFIG_URL, 'trigger/telemetry'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        },
        body: JSON.stringify(report)
      }
    )
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : String(error)
    }
  }

  // countryconfig replies 2xx whether it forwarded the report or skipped it
  // (telemetry disabled); either way the day is covered. Anything else is an
  // error we surface so the worker retries.
  if (response.ok) {
    return { status: 'sent' }
  }

  const detail = await response.text().catch(() => '')
  return {
    status: 'error',
    httpStatus: response.status,
    message: detail || response.statusText
  }
}

/**
 * Collects the current metrics and hands them to countryconfig for the given
 * day. Defaults to today's UTC window so the same report is produced across
 * retries.
 */
export async function runDailyTelemetry(
  reportedAt: string = startOfUtcDay()
): Promise<TelemetrySendResult> {
  let authorization: string
  try {
    authorization = `Bearer ${await getServiceToken()}`
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(
      `Telemetry: could not obtain an auth token for ${reportedAt}: ${message}`
    )
    return { status: 'error', message }
  }

  const metrics = await collectTelemetryMetrics()
  const report = buildTelemetryReport(metrics, reportedAt)
  const result = await sendTelemetryReport(report, authorization)

  if (result.status === 'sent') {
    logger.info(`Telemetry: report for ${reportedAt} handed to countryconfig`)
  } else if (result.status === 'error') {
    logger.error(
      `Telemetry: failed to hand report for ${reportedAt} to countryconfig: ${
        result.httpStatus ? `HTTP ${result.httpStatus} — ` : ''
      }${result.message}`
    )
  }

  return result
}
