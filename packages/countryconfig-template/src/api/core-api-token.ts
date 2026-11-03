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
import fetch, { Response } from 'node-fetch'
import {
  AUTH_URL,
  COUNTRY_CONFIG_CLIENT_ID,
  COUNTRY_CONFIG_CLIENT_SECRET
} from '@countryconfig/constants'
import { logger } from '@countryconfig/logger'

/** System tokens live 10 minutes; one is reused for less than that. */
const REUSE_FOR_MS = 5 * 60 * 1000

let cached: { token: string; fetchedAt: number } | undefined

/**
 * A token of country config's own system client, for calls to core. Core's
 * requests to country config are signed and carry no token to reuse.
 * Undefined when no client is configured or auth does not answer; the caller
 * then skips its call to core.
 */
export async function getCoreApiToken(): Promise<string | undefined> {
  if (!COUNTRY_CONFIG_CLIENT_ID || !COUNTRY_CONFIG_CLIENT_SECRET) {
    return undefined
  }
  if (cached && Date.now() - cached.fetchedAt < REUSE_FOR_MS) {
    return cached.token
  }

  const response = await fetch(new URL('/token', AUTH_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: COUNTRY_CONFIG_CLIENT_ID,
      client_secret: COUNTRY_CONFIG_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  }).catch((error: unknown) => error)
  if (!(response instanceof Response) || !response.ok) {
    logger.error(
      `Could not get a token for the country config system client: ${
        response instanceof Response ? response.status : String(response)
      }`
    )
    return undefined
  }

  const { access_token: token } = (await response.json()) as {
    access_token: string
  }
  cached = { token, fetchedAt: Date.now() }
  return token
}
