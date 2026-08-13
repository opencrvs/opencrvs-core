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
import { env } from '@events/environment'
import { getApplicationConfig } from '@events/service/config/config'
import { collectTelemetryMetrics, TelemetryMetrics } from './metrics'

/**
 * Payload contract version. Bumped only for breaking changes to the envelope;
 * additive metric keys do not require a bump. Part of the server's idempotency
 * key `(country_code, domain, reported_at, schema_version)`.
 */
export const TELEMETRY_SCHEMA_VERSION = '1.0'

/** Metrics map size limits enforced by the ingest endpoint. */
const MIN_METRICS = 1
const MAX_METRICS = 500

/** The `/v1/telemetry` request envelope. */
export interface TelemetryReport {
  schema_version: string
  reported_at: string
  country_code: string
  domain: string | null
  instance: {
    application_name: string
    environment?: string
    app_version?: string
  }
  metrics: TelemetryMetrics
}

/** Instance identity for a report, resolved from the application config. */
export interface TelemetryContext {
  countryCode: string
  applicationName: string
  domain: string | null
  environment?: string
}

export type TelemetrySendResult =
  | { status: 'accepted'; reportId: string; metricsRecorded: number }
  | { status: 'duplicate'; reportId: string }
  | { status: 'skipped'; reason: string }
  | { status: 'error'; httpStatus?: number; message: string }

/**
 * Midnight (UTC) of the given day as an ISO 8601 string. Used as `reported_at`
 * so that retries — and restarts — within the same day resolve to the same
 * value. The server's idempotency key then collapses duplicate sends to a
 * single report, which keeps at-most-once daily reporting from double-counting.
 */
export function startOfUtcDay(date: Date = new Date()): string {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

export function buildTelemetryReport(
  metrics: TelemetryMetrics,
  reportedAt: string,
  context: TelemetryContext
): TelemetryReport {
  return {
    schema_version: TELEMETRY_SCHEMA_VERSION,
    reported_at: reportedAt,
    country_code: context.countryCode,
    domain: context.domain,
    instance: {
      application_name: context.applicationName,
      environment: context.environment,
      // Set by the package manager when the service is started via a script.
      app_version: process.env.npm_package_version
    },
    metrics
  }
}

/**
 * POSTs a single report to the telemetry ingest endpoint. Network and server
 * errors are returned rather than thrown so the caller (the daily worker) can
 * decide whether to retry — the stable `reported_at` makes a retry safe.
 */
export async function sendTelemetryReport(
  report: TelemetryReport
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
    response = await fetch(env.TELEMETRY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(report)
    })
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : String(error)
    }
  }

  // 202 Accepted — stored; 200 OK — idempotent duplicate. Anything else is an
  // error we surface to the caller.
  if (response.status === 202) {
    const body = (await response.json().catch(() => ({}))) as {
      report_id?: string
      metrics_recorded?: number
    }
    return {
      status: 'accepted',
      reportId: body.report_id ?? '',
      metricsRecorded: body.metrics_recorded ?? entries
    }
  }

  if (response.status === 200) {
    const body = (await response.json().catch(() => ({}))) as {
      report_id?: string
    }
    return { status: 'duplicate', reportId: body.report_id ?? '' }
  }

  const detail = await response.text().catch(() => '')
  return {
    status: 'error',
    httpStatus: response.status,
    message: detail || response.statusText
  }
}

/**
 * Collects the current metrics and reports them for the given day. Defaults to
 * today's UTC window so the same report is produced across retries.
 */
export async function runDailyTelemetry(
  reportedAt: string = startOfUtcDay()
): Promise<TelemetrySendResult> {
  const applicationConfig = await getApplicationConfig()
  if (!applicationConfig.TELEMETRY_ENABLED) {
    logger.info(
      'Telemetry: disabled in application config (TELEMETRY_ENABLED is false) — skipping report'
    )
    return {
      status: 'skipped',
      reason: 'TELEMETRY_ENABLED is false in the application config'
    }
  }

  const domain = applicationConfig.TELEMETRY_DOMAIN ?? null
  const environment = applicationConfig.TELEMETRY_ENVIRONMENT
  logger.info(
    `Telemetry: enabled for ${applicationConfig.COUNTRY_CODE} — domain=${
      domain ?? '(unset)'
    }, environment=${environment ?? '(unset)'}, reporting for ${reportedAt}`
  )

  const metrics = await collectTelemetryMetrics()
  const report = buildTelemetryReport(metrics, reportedAt, {
    countryCode: applicationConfig.COUNTRY_CODE,
    applicationName: applicationConfig.APPLICATION_NAME,
    domain,
    environment
  })
  const result = await sendTelemetryReport(report)

  if (result.status === 'accepted') {
    logger.info(
      `Telemetry: reported ${result.metricsRecorded} metrics for ${reportedAt} (report ${result.reportId})`
    )
  } else if (result.status === 'duplicate') {
    logger.info(`Telemetry: report for ${reportedAt} already recorded`)
  } else if (result.status === 'error') {
    logger.error(
      `Telemetry: failed to report for ${reportedAt}: ${
        result.httpStatus ? `HTTP ${result.httpStatus} — ` : ''
      }${result.message}`
    )
  }

  return result
}
