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
import superjson from 'superjson'
import { chunk } from 'lodash'
import { createTRPCClient, httpLink } from '@trpc/client'
import type { InitialisationRouter } from '@opencrvs/events/src/router'
import { AUTH_URL, GATEWAY_URL } from '@countryconfig/constants'
import { logger } from '@countryconfig/logger'
import { generateSyntheticLocations } from './synthetic'
import { SYNTHETIC } from './synthetic-config'

/**
 * Rows per mutation. The gateway caps request bodies at 50MB and a location
 * carrying a few version elements is roughly 800 bytes of JSON, so a full
 * country of 50k+ locations does not fit in one request.
 */
const CHUNK_SIZE = 5000

/** Re-mint when this little of the token's life is left. */
const TOKEN_REFRESH_MARGIN_MS = 60 * 1000

function expiryOf(token: string): number {
  const { exp } = decode<{ exp?: number }>(token)

  // No `exp` should not happen for an initialisation token; treating it as
  // already expired forces one refresh rather than risking a mid-run 401.
  return exp ? exp * 1000 : 0
}

/**
 * The token `data-seeder` forwards is an initialisation token, which lives for
 * `CONFIG_SYSTEM_TOKEN_EXPIRY_SECONDS` (600 by default). A large generation run
 * outlives that, so the token is re-minted from the super-user password before
 * it expires rather than after a mutation has already failed.
 *
 * `authenticate-super-user` is the only way to obtain another one, and it stops
 * working once `data-seeder` calls `complete()` — which happens after this, so
 * the window is open for the whole run.
 */
class InitialisationToken {
  private token: string
  private expiresAt: number

  constructor(forwarded: string) {
    this.token = forwarded
    this.expiresAt = expiryOf(forwarded)
  }

  async get(): Promise<string> {
    if (this.expiresAt - Date.now() > TOKEN_REFRESH_MARGIN_MS) {
      return this.token
    }

    logger.info('Initialisation token is about to expire, re-minting.')

    const url = new URL('/authenticate-super-user', AUTH_URL).href
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: SYNTHETIC.superUserPassword })
    })

    if (!response.ok) {
      throw new Error(
        `Synthetic seeding outlived its token and could not re-authenticate against ${url} ` +
          `(${response.status} ${response.statusText}). Check SYNTHETIC.superUserPassword, or raise ` +
          'CONFIG_SYSTEM_TOKEN_EXPIRY_SECONDS for the run.'
      )
    }

    const { token } = (await response.json()) as { token: string }
    this.token = token
    this.expiresAt = expiryOf(token)

    return token
  }
}

function createClient(token: InitialisationToken) {
  return createTRPCClient<InitialisationRouter>({
    links: [
      httpLink({
        url: new URL('events/initialisation/', GATEWAY_URL).href,
        transformer: superjson,
        async headers() {
          return { authorization: `Bearer ${await token.get()}` }
        }
      })
    ]
  })
}

/**
 * Sends `rows` through `send`, one chunk at a time and in order.
 *
 * Order is load-bearing for administrative areas: `parent_id` is a
 * non-deferrable FK and the server itself chunks at 1000 rows, so a child in an
 * earlier request than its parent fails outright.
 */
async function sendInChunks<T>(
  label: string,
  rows: T[],
  send: (batch: T[]) => Promise<unknown>
) {
  for (const [index, batch] of chunk(rows, CHUNK_SIZE).entries()) {
    await send(batch)
    logger.info(
      `${label} ${index * CHUNK_SIZE + batch.length}/${rows.length} seeded`
    )
  }
}

/**
 * Generates a synthetic country and writes it through the initialisation
 * mutations, using the token `data-seeder` forwarded.
 */
export async function seedSyntheticLocations(forwardedToken: string) {
  const synthetic = generateSyntheticLocations(SYNTHETIC)

  logger.info(synthetic.summary)

  const client = createClient(new InitialisationToken(forwardedToken))

  await sendInChunks(
    'Synthetic administrative areas',
    synthetic.administrativeAreas,
    (batch) => client.administrativeAreas.set.mutate(batch)
  )
  await sendInChunks('Synthetic locations', synthetic.locations, (batch) =>
    client.locations.set.mutate(batch)
  )

  return {
    administrativeAreas: synthetic.administrativeAreas.length,
    locations: synthetic.locations.length,
    summary: synthetic.summary
  }
}
