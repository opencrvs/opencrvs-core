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

import { Request, ResponseToolkit } from '@hapi/hapi'
import * as Joi from 'joi'
import { isServiceToken } from '@opencrvs/toolkit/authentication'
import { sendTelemetry, TelemetryReport } from '@opencrvs/toolkit/telemetry'
import { env } from '@countryconfig/environment'
import { logger } from '@countryconfig/logger'
import { applicationConfig } from '@countryconfig/api/application/application-config'

/** Report the events service posts to `/trigger/telemetry`. */
export const telemetrySchema = Joi.object({
  reported_at: Joi.string().isoDate().required(),
  app_version: Joi.string().optional(),
  metrics: Joi.object()
    .pattern(
      Joi.string(),
      Joi.alternatives(Joi.number(), Joi.string(), Joi.boolean())
    )
    .required()
})

interface IncomingReport {
  reported_at: string
  app_version?: string
  metrics: Record<string, number | string | boolean>
}

/** Logged once at countryconfig startup while telemetry is disabled. */
export const TELEMETRY_DISABLED_NOTICE =
  'Telemetry is disabled. Help improve OpenCRVS by sharing anonymous, ' +
  'aggregate usage metrics (registration and certificate counts, active ' +
  'users, uptime) — no personal, health, or otherwise protected record data ' +
  'ever leaves your instance. Enable it by setting TELEMETRY_ENABLED=true on ' +
  'the countryconfig service.'

/**
 * Logs the telemetry configuration once at countryconfig startup: when enabled,
 * the instance identity that will be reported (so operators can confirm the env
 * vars are set as expected); otherwise the encouraging opt-in notice.
 */
export function logTelemetryStartupStatus() {
  if (!env.TELEMETRY_ENABLED) {
    logger.info(TELEMETRY_DISABLED_NOTICE)
    return
  }

  // Matches the handler's `domain` stamping: a wildcard/empty DOMAIN is not
  // reported.
  const domain =
    env.DOMAIN && env.DOMAIN !== '*' ? env.DOMAIN : '(not reported)'

  logger.info(
    'Telemetry is enabled — anonymous, aggregate usage metrics will be ' +
      'forwarded to the OpenCRVS status service. Reporting this instance as:\n' +
      `  COUNTRY_CODE     = ${env.COUNTRY_CODE}\n` +
      `  ORGANISATION     = ${env.ORGANISATION || '(not set)'}\n` +
      `  ENVIRONMENT_NAME = ${env.ENVIRONMENT_NAME}\n` +
      `  DOMAIN           = ${domain}\n` +
      `  application      = ${applicationConfig.APPLICATION_NAME}\n` +
      'Reports are only ever sent from production instances (NODE_ENV=production).'
  )
}

/**
 * Receives a usage report from the events service and, when telemetry is
 * enabled for this instance, stamps the instance identity onto it and forwards
 * it to the status service via the toolkit's `sendTelemetry` (which owns the
 * endpoint and payload schema). The events service is unaware of whether
 * telemetry is enabled or of the country code / domain / environment reported.
 */
export async function telemetryHandler(request: Request, h: ResponseToolkit) {
  // Only accept core's service token (the events service authenticates its
  // unattended telemetry POST with it; identified by its fixed `sub`). A
  // logged-in user's token has a different subject, so a user cannot submit
  // telemetry with their own credentials — and the service-token endpoint is
  // not reachable through the public gateway.
  if (!isServiceToken(request.auth.credentials)) {
    logger.warn(
      'Telemetry: rejected a request that is not from the service token'
    )
    return h.response({ error: 'forbidden' }).code(403)
  }

  if (!env.TELEMETRY_ENABLED) {
    // The encouraging notice is logged once at startup (see index.ts); keep the
    // per-report path quiet.
    return h.response({ status: 'skipped' }).code(200)
  }

  const incoming = request.payload as IncomingReport

  // Only production instances report; staging, QA and local build the report
  // but never reach the status service. (This gate used to live in the
  // toolkit's sendTelemetry; each country config now owns it.)
  if (!env.isProduction) {
    logger.info(
      `Telemetry: report for ${incoming.reported_at} was not sent — only production instances report`
    )
    return h.response({ status: 'skipped' }).code(200)
  }

  const report: TelemetryReport = {
    reported_at: incoming.reported_at,
    country_code: env.COUNTRY_CODE,
    organisation: env.ORGANISATION,
    // env.DOMAIN defaults to a wildcard for CORS in some setups; treat that as
    // "no domain" rather than reporting a literal "*".
    domain: env.DOMAIN && env.DOMAIN !== '*' ? env.DOMAIN : null,
    instance: {
      application_name: applicationConfig.APPLICATION_NAME,
      environment: env.ENVIRONMENT_NAME,
      app_version: incoming.app_version
    },
    metrics: incoming.metrics
  }

  let result
  try {
    result = await sendTelemetry(report)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`Telemetry: forwarding to status service failed: ${message}`)
    return h.response({ status: 'error' }).code(502)
  }

  if (result.outcome === 'rejected') {
    logger.error(
      `Telemetry: status service rejected report (HTTP ${result.status}): ${result.detail ?? ''}`
    )
    return h.response({ status: 'error' }).code(502)
  }

  logger.info(
    `Telemetry: forwarded report for ${report.reported_at} to the status service`
  )
  return h.response({ status: 'forwarded' }).code(202)
}
