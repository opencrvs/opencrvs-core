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
import fetch from 'node-fetch'
import { env } from '@countryconfig/environment'
import { logger } from '@countryconfig/logger'
import { applicationConfig } from '@countryconfig/api/application/application-config'

/**
 * Payload contract version of the status/telemetry service. Part of its
 * idempotency key `(country_code, domain, reported_at, schema_version)`.
 */
const TELEMETRY_SCHEMA_VERSION = '1.0'

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

interface TelemetryReport {
  reported_at: string
  app_version?: string
  metrics: Record<string, number | string | boolean>
}

/**
 * Receives a usage report from the events service and, when telemetry is
 * enabled for this instance, stamps the instance identity onto it and forwards
 * it to the status service. The events service is unaware of whether telemetry
 * is enabled or of the country code / domain / environment reported.
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
    logger.info('Telemetry: disabled — not forwarding report')
    return h.response({ status: 'skipped' }).code(200)
  }

  const report = request.payload as TelemetryReport

  const envelope = {
    schema_version: TELEMETRY_SCHEMA_VERSION,
    reported_at: report.reported_at,
    country_code: env.COUNTRY_CODE,
    organisation: env.ORGANISATION,
    // env.DOMAIN defaults to a wildcard for CORS in some setups; treat that as
    // "no domain" rather than reporting a literal "*".
    domain: env.DOMAIN && env.DOMAIN !== '*' ? env.DOMAIN : null,
    instance: {
      application_name: applicationConfig.APPLICATION_NAME,
      environment: env.ENVIRONMENT_NAME,
      app_version: report.app_version
    },
    metrics: report.metrics
  }

  let response
  try {
    response = await fetch(env.TELEMETRY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envelope)
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`Telemetry: forwarding to status service failed: ${message}`)
    return h.response({ status: 'error' }).code(502)
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    logger.error(
      `Telemetry: status service rejected report (HTTP ${response.status}): ${detail}`
    )
    return h.response({ status: 'error' }).code(502)
  }

  logger.info(
    `Telemetry: forwarded report for ${report.reported_at} to the status service`
  )
  return h.response({ status: 'forwarded' }).code(202)
}
