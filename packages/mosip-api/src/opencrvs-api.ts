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
import { env, OPENCRVS_PUBLIC_KEY_URL } from './constants'
import { createClient } from '@opencrvs/toolkit/api'
import crypto from 'node:crypto'
import { decode } from 'jsonwebtoken'
import type { FastifyBaseLogger } from 'fastify'
import { EventDocument, getPendingAction } from '@opencrvs/toolkit/events'
import { EncodedScope, hasScope } from '@opencrvs/toolkit/scopes'

export class OpenCRVSError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OpenCRVSError'
  }
}

/** Fetches the public key from OpenCRVS to be able to verify JWTs */
export const getPublicKey = async (
  logger: FastifyBaseLogger
): Promise<string> => {
  try {
    const response = await fetch(OPENCRVS_PUBLIC_KEY_URL)
    return response.text()
  } catch (error) {
    logger.warn(
      {
        event: 'opencrvs.public-key.fetch.failed',
        opencrvsPublicKeyUrl: OPENCRVS_PUBLIC_KEY_URL,
        err: error
      },
      'Failed to fetch OpenCRVS public key'
    )

    if (env.isProd) {
      throw error
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))
    return getPublicKey(logger)
  }
}

/**
 * Obtains a token for this integration's own OpenCRVS system client via the
 * client_credentials grant. Registration confirmations authenticate with this
 * token, so they are audited as this integration and survive OpenCRVS
 * redeployments (there is no per-record token stored at registration time).
 */
export const getSystemToken = async (): Promise<string> => {
  const clientCredentialsParams = new URLSearchParams({
    client_id: env.OPENCRVS_CLIENT_ID,
    client_secret: env.OPENCRVS_CLIENT_SECRET,
    grant_type: 'client_credentials'
  })
  const response = await fetch(`${env.OPENCRVS_AUTH_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: clientCredentialsParams
  })
  if (!response.ok) {
    throw new OpenCRVSError(
      `client_credentials authentication failed: ${response.status} ${await response.text()}`
    )
  }
  const { access_token: systemToken } = (await response.json()) as {
    access_token: string
  }

  return systemToken
}

/**
 * Fails fast on startup unless this integration's system client can authenticate
 * and holds `record.register` — the scope its registration confirmations require
 * ([[opencrvs-api]] `confirmRegistration`). Without it every confirmation would
 * fail asynchronously, long after the record was sent to MOSIP.
 */
export const assertCanConfirmRegistrations = async (
  logger: FastifyBaseLogger
): Promise<void> => {
  let scope: string[]
  try {
    const token = await getSystemToken()
    const payload = decode(token) as { scope?: string[] } | null
    scope = payload?.scope ?? []
  } catch (error) {
    logger.error(
      { event: 'opencrvs.system-client.auth.failed', err: error },
      'Could not authenticate the OpenCRVS system client. Set OPENCRVS_CLIENT_ID and OPENCRVS_CLIENT_SECRET to valid credentials.'
    )
    process.exit(1)
  }

  if (!hasScope(scope as EncodedScope[], 'record.register')) {
    logger.error(
      { event: 'opencrvs.system-client.scope.missing', scope },
      "The OpenCRVS system client is missing the 'record.register' scope required to confirm registrations."
    )
    process.exit(1)
  }

  if (!hasScope(scope as EncodedScope[], 'record.read')) {
    logger.error(
      { event: 'opencrvs.system-client.scope.missing', scope },
      "The OpenCRVS system client is missing the 'record.read' scope required to confirm registrations."
    )
    process.exit(1)
  }

  if (!hasScope(scope as EncodedScope[], 'record.correct')) {
    logger.error(
      { event: 'opencrvs.system-client.scope.missing', scope },
      "The OpenCRVS system client is missing the 'record.correct' scope required to confirm registrations."
    )
    process.exit(1)
  }
}

export const confirmRegistration = (
  {
    eventId,
    actionId,
    nationalId,
    registrationNumber
  }: {
    eventId: string
    actionId: string
    nationalId?: string
    registrationNumber: string
  },
  { token, logger }: { token: string; logger?: FastifyBaseLogger }
) => {
  const url = new URL('events', env.OPENCRVS_GATEWAY_URL).toString()
  const client = createClient(url, `Bearer ${token}`)

  logger?.debug(
    {
      event: 'opencrvs.registration.confirm.request',
      eventId,
      actionId,
      registrationNumber
    },
    'Confirming OpenCRVS registration'
  )

  return client.event.actions.register.accept
    .mutate({
      transactionId: `mosip-interop-${crypto.randomUUID()}`,
      eventId,
      actionId,
      registrationNumber,
      declaration: {
        'child.nid': nationalId
      }
    })
    .catch((err: unknown) => {
      logger?.warn(
        {
          event: 'opencrvs.registration.confirm.failed',
          err,
          eventId,
          actionId,
          registrationNumber
        },
        'Failed to confirm OpenCRVS registration'
      )
      throw err
    })
}

export const findEventActionType = async (
  eventId: string,
  { token }: { token: string }
) => {
  const url = new URL('events', env.OPENCRVS_GATEWAY_URL).toString()
  const client = createClient(url, `Bearer ${token}`)

  const event = (await client.event.get.query({ eventId })) as EventDocument

  let action: ReturnType<typeof getPendingAction>
  try {
    action = getPendingAction(event.actions)
  } catch {
    return null
  }

  return {
    actionId: action.id,
    actionType: action.type,
    eventType: event.type,
    requestId:
      action.type === 'APPROVE_CORRECTION' ? action.requestId : undefined
  }
}

export const confirmApprovedBirthCorrection = (
  {
    eventId,
    actionId,
    requestId,
    nationalId
  }: {
    eventId: string
    actionId: string
    requestId: string
    nationalId: string
  },
  { token, logger }: { token: string; logger?: FastifyBaseLogger }
) => {
  const url = new URL('events', env.OPENCRVS_GATEWAY_URL).toString()
  const client = createClient(url, `Bearer ${token}`)

  logger?.debug(
    {
      event: 'opencrvs.birth-correction.confirm.request',
      eventId,
      actionId,
      requestId
    },
    'Confirming approved OpenCRVS birth correction'
  )

  return client.event.actions.correction.approve.accept
    .mutate({
      transactionId: `mosip-interop-${crypto.randomUUID()}`,
      eventId,
      actionId,
      requestId,
      declaration: {
        'child.nid': nationalId
      }
    })
    .catch((err: unknown) => {
      logger?.warn(
        {
          event: 'opencrvs.birth-correction.confirm.failed',
          err,
          eventId,
          actionId,
          requestId
        },
        'Failed to confirm approved OpenCRVS birth correction'
      )
      throw err
    })
}
