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
import * as Hapi from '@hapi/hapi'
import fetch from 'node-fetch'
import { encodeScope, Scope } from '@opencrvs/toolkit/scopes'
import { logger } from '@countryconfig/logger'
import {
  MOSIP_INTEGRATION_CLIENT_ID,
  MOSIP_INTEGRATION_CLIENT_SECRET,
  EVENTS_URL
} from '@countryconfig/constants'

interface IntegrationConfig {
  name: string
  scopes: Scope[]
  /**
   * Optional pre-shared credentials. When both are set, events seeds the
   * integration with exactly these values so the integrating system (e.g.
   * mosip-api) can authenticate immediately using the same client id/secret it
   * carries in its own env — no manual "Refresh secret" step required. When
   * omitted, events generates credentials and an NSA reveals them via the
   * Integrations page.
   *
   * Both must be given together; events rejects a half-seeded pair.
   */
  clientId?: string
  clientSecret?: string
}

/**
 * Integrations to register on startup. Each entry maps to a POST /integrations
 * call against the events service.
 *
 * Registration is skipped for any name that already exists, so restarts never
 * clobber a secret a National System Admin has rotated.
 *
 * Set clientId/clientSecret to seed the credentials the integrating system
 * already holds. Leave them unset to have events generate credentials, which
 * an NSA then retrieves via the Integrations UI (Configurations →
 * Integrations → Reveal keys → Refresh secret).
 */
const INTEGRATIONS: IntegrationConfig[] = [
  {
    name: 'MOSIP',
    scopes: [
      { type: 'record.register', options: { event: ['birth', 'death'] } }
    ],
    clientId: MOSIP_INTEGRATION_CLIENT_ID || undefined,
    clientSecret: MOSIP_INTEGRATION_CLIENT_SECRET || undefined
  }
]

async function listIntegrationsByName(bearerToken: string) {
  const res = await fetch(new URL('/integrations', EVENTS_URL).toString(), {
    method: 'GET',
    headers: { Authorization: bearerToken }
  })

  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text()}`)
  }

  const integrations = (await res.json()) as { id: string; name: string }[]

  return new Map(
    integrations.map((integration) => [integration.name, integration])
  )
}

export async function systemReadyHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  if (INTEGRATIONS.length === 0) {
    return h.response().code(200)
  }

  const bearerToken = request.headers.authorization

  if (typeof bearerToken !== 'string') {
    // The route inherits the default jwt strategy, so an authenticated request
    // always carries exactly one Authorization header — Hapi types it as the
    // wider header union. Answer 503 rather than calling events without the
    // bootstrap token, which could not succeed: events retries on a failing
    // status, so a transient oddity here is not permanent.
    logger.warn(
      'Skipping integration registration, request carries no bearer token'
    )
    return h.response().code(503)
  }

  let existing: Map<string, { id: string; name: string }>

  try {
    existing = await listIntegrationsByName(bearerToken)
  } catch (error) {
    // Without the existing list we cannot tell a first registration from a
    // restart, and creating blindly would duplicate the integration and
    // invalidate the credentials already in use. Answer 503 rather than 200:
    // events retries the trigger on a failing status, and reporting success
    // here would consume the only attempt that will ever be made, leaving the
    // integration unregistered until events happens to restart.
    logger.warn(
      `Skipping integration registration, listing integrations failed: ${
        error instanceof Error ? error.message : error
      }`
    )
    return h.response().code(503)
  }

  // Every integration is attempted before answering, so one failure does not
  // hide the others. Retrying is safe: names already registered are skipped.
  let anyFailed = false

  for (const integration of INTEGRATIONS) {
    const alreadyRegistered = existing.get(integration.name)

    if (alreadyRegistered) {
      // Registration is skipped by name so a restart never clobbers a secret a
      // National System Admin has rotated. That also means a changed clientId
      // is silently ignored, and the integrating system then authenticates
      // with a client id that does not exist — a 401 with nothing in these
      // logs to explain it. Say so instead.
      if (
        integration.clientId &&
        integration.clientId !== alreadyRegistered.id
      ) {
        logger.warn(
          `Integration "${integration.name}" is registered as client id ${alreadyRegistered.id}, but ${integration.clientId} is configured. The configured credentials are NOT in use and authentication with them will fail. Delete the existing integration to re-seed it, or point the integrating system at the registered client id.`
        )
      } else {
        logger.info(
          `Integration "${integration.name}" already registered, skipping`
        )
      }

      continue
    }

    const credentials =
      integration.clientId && integration.clientSecret
        ? {
            clientId: integration.clientId,
            clientSecret: integration.clientSecret
          }
        : undefined

    // Half a pair is almost always a missed env var. Without this the
    // integration is registered with generated credentials and the
    // integrating system silently fails to authenticate as itself.
    if (!credentials && (integration.clientId || integration.clientSecret)) {
      logger.warn(
        `Integration "${integration.name}" has only one of clientId/clientSecret configured. Both are required to seed credentials, so events will generate them instead.`
      )
    }

    try {
      const res = await fetch(new URL('/integrations', EVENTS_URL).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: bearerToken
        },
        body: JSON.stringify({
          name: integration.name,
          scopes: integration.scopes.map(encodeScope),
          credentials
        })
      })

      if (!res.ok) {
        anyFailed = true
        logger.warn(
          `Registering integration "${integration.name}" failed: ${res.status} ${await res.text()}`
        )
      } else {
        logger.info(
          credentials
            ? `Integration "${integration.name}" registered successfully with pre-shared credentials`
            : `Integration "${integration.name}" registered successfully with generated credentials. A National System Admin must reveal them via Configurations → Integrations.`
        )
      }
    } catch (error) {
      anyFailed = true
      logger.warn(
        `Registering integration "${integration.name}" threw: ${error instanceof Error ? error.message : error}`
      )
    }
  }

  // 503 asks events to retry. Answering 200 with an integration unregistered
  // spends the only attempt events makes, and the symptom surfaces far away:
  // the integrating system authenticates as a client that does not exist.
  return h.response().code(anyFailed ? 503 : 200)
}
