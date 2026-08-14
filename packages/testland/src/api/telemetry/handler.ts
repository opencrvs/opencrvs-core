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
 * Receives a usage report from the events service and, when telemetry is
 * enabled for this instance, stamps the instance identity onto it and forwards
 * it to the status service via the toolkit's `sendTelemetry` (which owns the
 * endpoint and payload schema). The events service is unaware of whether
 * telemetry is enabled or of the country code / domain / environment reported.
 */
export async function telemetryHandler(request: Request, h: ResponseToolkit) {
  // Only accept OpenCRVS *system* tokens (the events service's anonymous
  // token has userType 'system'). A logged-in user's token is a 'user' token,
  // so a user cannot submit telemetry with their own credentials — and the
  // anonymous-token endpoint is not reachable through the public gateway.
  const credentials = request.auth.credentials as
    | { userType?: string }
    | undefined
  if (credentials?.userType !== 'system') {
    logger.warn('Telemetry: rejected a request that is not from a system token')
    return h.response({ error: 'forbidden' }).code(403)
  }

  if (!env.TELEMETRY_ENABLED) {
    // The encouraging notice is logged once at startup (see index.ts); keep the
    // per-report path quiet.
    return h.response({ status: 'skipped' }).code(200)
  }

  const incoming = request.payload as IncomingReport

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

  if (result.outcome === 'skipped') {
    logger.info(
      `Telemetry: report for ${report.reported_at} was not sent — only production instances report`
    )
    return h.response({ status: 'skipped' }).code(200)
  }

  logger.info(
    `Telemetry: forwarded report for ${report.reported_at} to the status service`
  )
  return h.response({ status: 'forwarded' }).code(202)
}
