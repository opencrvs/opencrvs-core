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

/**
 * Endpoint of the OpenCRVS status/telemetry service. Hardcoded here — together
 * with the {@link TelemetryReport} shape and `SCHEMA_VERSION` — so the URL and
 * the payload contract are owned by core. A core release can change any of
 * them; a country configuration picks the change up (and any now-incompatible
 * payload surfaces as a TypeScript error) simply by upgrading `@opencrvs/toolkit`.
 */
const TELEMETRY_URL = 'https://status.opencrvs.org/v1/telemetry'

/** Payload contract version. Part of the service's idempotency key. */
const SCHEMA_VERSION = '1.0'

/** A single telemetry metric value. */
export type TelemetryMetricValue = number | string | boolean

/**
 * The telemetry report a country configuration hands to {@link sendTelemetry}.
 * `schema_version` is stamped by `sendTelemetry`, not by the caller.
 */
export interface TelemetryReport {
  /** Client clock, ISO 8601. Kept stable across retries of the same report. */
  reported_at: string
  /** ISO-style country code of the instance. */
  country_code: string
  /** Organisation running the instance. Empty string when unset. */
  organisation: string
  /** Public domain of the instance, or `null`. */
  domain: string | null
  instance: {
    application_name: string
    environment: string
    app_version?: string
  }
  /** Flat map of dotted metric keys to primitive values. */
  metrics: Record<string, TelemetryMetricValue>
}

/** Outcome of a {@link sendTelemetry} call. */
export interface TelemetryResult {
  /**
   * How the send resolved:
   * - `sent` — the status service accepted the report (2xx);
   * - `rejected` — the status service returned a non-2xx response.
   */
  outcome: 'sent' | 'rejected'
  /** HTTP status of the request. */
  status: number
  /** Response body for a `rejected` outcome. */
  detail?: string
}

/**
 * Sends a telemetry report to the OpenCRVS status service. The endpoint and the
 * schema version are fixed by this version of the toolkit.
 *
 * This always attempts the send; deciding *whether* to report (e.g. only from
 * production instances) is the caller's responsibility. Network errors reject.
 */
export async function sendTelemetry(
  report: TelemetryReport
): Promise<TelemetryResult> {
  const response = await fetch(TELEMETRY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schema_version: SCHEMA_VERSION, ...report })
  })

  if (response.ok) {
    return { outcome: 'sent', status: response.status }
  }

  const detail = await response.text().catch(() => '')
  return { outcome: 'rejected', status: response.status, detail }
}
