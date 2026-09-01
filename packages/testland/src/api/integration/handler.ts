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
   * carries in its own env — no manual "Refresh secret" step required. When omitted, events
   * generates credentials and an NSA reveals them via the Integrations page.
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
 * already holds. See `IntegrationConfig` above for what happens when they are
 * omitted.
 */
const INTEGRATIONS: IntegrationConfig[] = [
  {
    name: 'MOSIP',
    scopes: [
      { type: 'record.register', options: { event: ['birth', 'death'] } },
      { type: 'record.read', options: { event: ['birth', 'death'] } }
    ],
    clientId: MOSIP_INTEGRATION_CLIENT_ID,
    clientSecret: MOSIP_INTEGRATION_CLIENT_SECRET
  }
]

const INTEGRATIONS_URL = new URL('/integrations', EVENTS_URL).toString()

/**
 * Bound every call to events. The caller aborts its own request after 5s and
 * retries, and Hapi does not cancel a handler when its client goes away — so an
 * unbounded fetch here outlives the request it belongs to, and each retry
 * stacks another registration run that has already read a now-stale list of
 * existing integrations. Kept under the caller's budget so this handler answers
 * for itself instead of being abandoned mid-flight.
 */
const REQUEST_TIMEOUT_MS = 2000

/** Client id of every currently registered integration, keyed by name. */
async function listClientIdsByName(bearerToken: string) {
  const res = await fetch(INTEGRATIONS_URL, {
    method: 'GET',
    headers: { Authorization: bearerToken },
    timeout: REQUEST_TIMEOUT_MS
  })

  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text()}`)
  }

  const integrations = (await res.json()) as { id: string; name: string }[]

  return new Map(integrations.map(({ name, id }) => [name, id]))
}

/** False only when the integration did not end up registered. */
async function ensureRegistered(
  integration: IntegrationConfig,
  registeredClientId: string | undefined,
  bearerToken: string
) {
  const { name, clientId, clientSecret } = integration

  if (registeredClientId !== undefined) {
    // Skipping by name means a changed clientId is silently ignored, and the
    // integrating system then authenticates with a client id that does not
    // exist — a 401 with nothing in these logs to explain it. Say so instead.
    if (clientId && clientId !== registeredClientId) {
      logger.warn(
        `Integration "${name}" is registered as client id ${registeredClientId}, but ${clientId} is configured. The configured credentials are NOT in use and authentication with them will fail. Delete the existing integration to re-seed it, or point the integrating system at the registered client id.`
      )
    } else {
      logger.info(`Integration "${name}" already registered, skipping`)
    }

    return true
  }

  // Half a pair is almost always a missed env var. Without this the integration
  // is registered with generated credentials and the integrating system
  // silently fails to authenticate as itself.
  if (Boolean(clientId) !== Boolean(clientSecret)) {
    logger.warn(
      `Integration "${name}" has only one of clientId/clientSecret configured. Both are required to seed credentials, so events will generate them instead.`
    )
  }

  const credentials =
    clientId && clientSecret ? { clientId, clientSecret } : undefined

  try {
    const res = await fetch(INTEGRATIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: bearerToken
      },
      body: JSON.stringify({
        name,
        scopes: integration.scopes.map(encodeScope),
        credentials
      }),
      timeout: REQUEST_TIMEOUT_MS
    })

    if (!res.ok) {
      logger.warn(
        `Registering integration "${name}" failed: ${res.status} ${await res.text()}`
      )
      return false
    }

    logger.info(
      credentials
        ? `Integration "${name}" registered successfully with pre-shared credentials`
        : `Integration "${name}" registered successfully with generated credentials. A National System Admin must reveal them via Configurations → Integrations.`
    )

    return true
  } catch (error) {
    logger.warn(
      `Registering integration "${name}" threw: ${error instanceof Error ? error.message : error}`
    )
    return false
  }
}

export async function systemReadyHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  // Unreachable while INTEGRATIONS is non-empty, kept so this file stays a
  // one-entry diff against packages/countryconfig-template, where the list
  // ships empty and events need not be reachable at all.
  if (INTEGRATIONS.length === 0) {
    return h.response().code(200)
  }

  const bearerToken = request.headers.authorization

  if (typeof bearerToken !== 'string') {
    // The route inherits the default jwt strategy, so an authenticated request
    // always carries exactly one Authorization header — Hapi types it as the
    // wider header union.
    logger.warn(
      'Skipping integration registration, request carries no bearer token'
    )
    return h.response().code(503)
  }

  let registeredClientIds: Map<string, string>

  try {
    registeredClientIds = await listClientIdsByName(bearerToken)
  } catch (error) {
    // Without the existing list we cannot tell a first registration from a
    // restart, and creating blindly would duplicate the integration and
    // invalidate the credentials already in use.
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
    const registered = await ensureRegistered(
      integration,
      registeredClientIds.get(integration.name),
      bearerToken
    )

    if (!registered) {
      anyFailed = true
    }
  }

  // A failing status is what makes events try again — it retries this trigger
  // with backoff, and treats 2xx as done. Answering 200 with an integration
  // unregistered ends that loop early, and the symptom surfaces far away: the
  // integrating system authenticates as a client that does not exist.
  return h.response().code(anyFailed ? 503 : 200)
}
