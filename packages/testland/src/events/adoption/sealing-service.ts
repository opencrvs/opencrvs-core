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
import fetch from 'node-fetch'
import decode from 'jwt-decode'
import { createClient } from '@opencrvs/toolkit/api'
import { defineScopes } from '@opencrvs/toolkit/scopes'
import { AUTH_URL, GATEWAY_URL } from '@countryconfig/constants'
import { logger } from '@countryconfig/logger'

/**
 * The adoption REGISTER trigger needs to seal a *different* record (the
 * original birth record) than the one it was called for. The token forwarded
 * to a trigger handler is a single-record token bound to the triggering
 * event's id (see @opencrvs/events token-exchange), so it can never be used
 * to act on another record. This module provisions a dedicated system
 * integration - scoped to exactly what sealing needs - to work around that.
 */

const INTEGRATION_NAME = 'Adoption sealing service'

// Seeded by default in testland's employee data (data-seeding/employees).
const NATIONAL_SYSTEM_ADMIN_USERNAME = 'j.campbell'
const NATIONAL_SYSTEM_ADMIN_PASSWORD = 'test'

const SEALING_SERVICE_SCOPES = defineScopes([
  { type: 'record.search' },
  {
    type: 'record.custom-action',
    options: { event: ['birth'], customActionTypes: ['SEAL'] }
  }
])

let credentials: { clientId: string; clientSecret: string } | undefined
let cachedToken: { token: string; expiresAt: number } | undefined

async function authenticateAsNationalSystemAdmin() {
  const authResponse = await fetch(`${AUTH_URL}/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: NATIONAL_SYSTEM_ADMIN_USERNAME,
      password: NATIONAL_SYSTEM_ADMIN_PASSWORD
    })
  })
  const { nonce } = (await authResponse.json()) as { nonce: string }

  const verifyResponse = await fetch(`${AUTH_URL}/verifyCode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // '000000' is the fixed verification code used across this demo/test
    // environment whenever two-factor authentication is disabled.
    body: JSON.stringify({ nonce, code: '000000' })
  })
  const { token } = (await verifyResponse.json()) as { token: string }
  return token
}

/**
 * Provisions the adoption sealing integration. Called once at server
 * startup. A fresh integration is (re)created every time rather than reused
 * across restarts, because its secret is only ever returned at creation time
 * (the server stores just a hash) - there is nothing for an operator to
 * configure by hand.
 */
export async function getAdoptionSealingIntegrationCredentials() {
  try {
    const adminToken = await authenticateAsNationalSystemAdmin()
    const client = createClient(
      new URL('events', GATEWAY_URL).toString(),
      `Bearer ${adminToken}`
    )

    const existingIntegrations = await client.integrations.list.query({
      status: 'active'
    })
    const previous = existingIntegrations.find(
      (integration) => integration.name === INTEGRATION_NAME
    )

    if (previous) {
      await client.integrations.delete.mutate({ id: previous.id })
    }

    const created = await client.integrations.create.mutate({
      name: INTEGRATION_NAME,
      scopes: SEALING_SERVICE_SCOPES
    })

    logger.info('Adoption sealing integration provisioned.')
    return {
      clientId: created.clientId,
      clientSecret: created.clientSecret
    }
  } catch (error) {
    logger.error(
      { err: error },
      'Failed to provision the adoption sealing integration. Adoption registrations will not be able to seal the original birth record until this is resolved.'
    )
    return undefined
  }
}

/**
 * Returns a bearer token for the adoption sealing integration, or undefined
 * if it could not be provisioned at startup.
 */
export async function getAdoptionSealingToken(): Promise<string | undefined> {
  const credentials = await getAdoptionSealingIntegrationCredentials()
  if (!credentials) {
    logger.warn('Adoption sealing integration is not available, skipping seal.')
    return undefined
  }

  const oneMinuteFromNow = Date.now() + 60 * 1000
  if (cachedToken && cachedToken.expiresAt > oneMinuteFromNow) {
    return cachedToken.token
  }

  const params = new URLSearchParams({
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    grant_type: 'client_credentials'
  })

  const response = await fetch(new URL('auth/token', GATEWAY_URL).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  })

  if (!response.ok) {
    throw new Error(
      `Failed to authenticate the adoption sealing integration: ${response.statusText}`
    )
  }

  const body = (await response.json()) as {
    token?: string
    access_token?: string
    expires_in?: number
  }
  const token = body.token ?? body.access_token

  if (!token) {
    throw new Error(
      'No token received when authenticating the adoption sealing integration'
    )
  }

  cachedToken = {
    token,
    expiresAt: getTokenExpiry(token, body.expires_in)
  }

  return token
}

const DEFAULT_TOKEN_EXPIRY_SECONDS = 600

/**
 * The client_credentials response never actually includes `expires_in` (see
 * packages/auth/src/features/oauthToken/responses.ts) - trusting a fallback
 * here previously caused tokens to be cached well past their real (and much
 * shorter, CONFIG_SYSTEM_TOKEN_EXPIRY_SECONDS - 10 minutes by default) JWT
 * expiry, leading to "Expired token" 401s. Decode the token's own `exp`
 * claim, which is authoritative, and only fall back to `expires_in`/a
 * conservative default if that's somehow not present.
 */
function getTokenExpiry(token: string, expiresInSeconds?: number): number {
  try {
    const { exp } = decode<{ exp?: number }>(token)
    if (exp) {
      return exp * 1000
    }
  } catch (error) {
    logger.warn(
      { err: error },
      'Failed to decode adoption sealing integration token to determine its expiry'
    )
  }

  return Date.now() + (expiresInSeconds ?? DEFAULT_TOKEN_EXPIRY_SECONDS) * 1000
}
