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
import * as z from 'zod/v4'
import { UUID } from '@opencrvs/commons'
import { env } from '@events/environment'
import {
  getSystemInitialisation as getSystemInitialisationQuery,
  completeSystemInitialisation as completeSystemInitialisationQuery
} from '@events/storage/postgres/system-initialisation'

export async function getServiceToken() {
  const res = await fetch(
    new URL('/internal/service-token', env.AUTH_URL).toString()
  )
  const { token } = await res.json()
  return token as string
}

/**
 * Callers retry on failure, so this must fail rather than stall. Auth and
 * events start concurrently, and without a timeout a peer that accepts the
 * connection but never answers parks the caller on its first attempt forever —
 * silently, since nothing is logged until an attempt settles.
 */
export async function getIntegrationCreatorToken(timeoutMs: number) {
  const res = await fetch(
    new URL('/internal/integration-creator-token', env.AUTH_URL).toString(),
    { method: 'POST', timeout: timeoutMs }
  )
  if (!res.ok) {
    throw new Error(
      `Failed to fetch integration creator token: ${res.status} ${res.statusText}`
    )
  }
  const { token } = await res.json()
  return token as string
}

/**
 * Fetches a token whose only scopes are `record.action.accept` and
 * `record.action.reject`, both bound to `actionId`.
 *
 * This is what core sends to the country configuration when it requests action
 * confirmation, in place of the caller's own token: the country configuration
 * can confirm the one action it was asked about and nothing else, and never
 * holds the registrar's write scopes.
 *
 * The caller's `token` authenticates the mint request; the resulting token
 * carries that same identity, so a confirmation is still attributed to the user
 * whose action it is.
 */
export async function getActionConfirmationToken(
  { eventId, actionId }: { eventId: UUID; actionId: UUID },
  token: string
) {
  const res = await fetch(
    new URL('/internal/action-confirmation-token', env.AUTH_URL).toString(),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ eventId, actionId })
    }
  )

  if (!res.ok) {
    throw new Error(
      `Failed to fetch action confirmation token: ${res.status} ${res.statusText}`
    )
  }

  const { token: actionConfirmationToken } = await res.json()
  return actionConfirmationToken as string
}

const SystemInitialisation = z
  .object({
    id: z.number(),
    hash: z.string(),
    salt: z.string(),
    completedAt: z.null()
  })
  .or(
    z.object({
      id: z.number(),
      hash: z.null(),
      salt: z.null(),
      completedAt: z.string()
    })
  )

export async function getSystemInitialisation() {
  const systemInitialisation = await getSystemInitialisationQuery()
  if (!systemInitialisation) {
    throw new Error('System initialisation not found')
  }

  const parsedSystemInitialisation =
    SystemInitialisation.parse(systemInitialisation)

  return parsedSystemInitialisation
}

export async function completeSystemInitialisation() {
  return completeSystemInitialisationQuery()
}
