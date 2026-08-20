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
import { RouteHandlerMethod } from 'fastify'
import { env } from '../constants'
import crypto from 'node:crypto'

/** Handles WebSub subscription coming from OpenCRVS */
export const webSubHubHandler: RouteHandlerMethod = async (_request, reply) => {
  const challengeToken = crypto.randomUUID()
  const response = await fetch(
    `${env.MOSIP_WEBSUB_CALLBACK_URL}?hub.challenge=${challengeToken}`,
    {
      method: 'GET'
    }
  )

  if (!response.ok) {
    throw new Error(
      `❌ Failed to send challenge to OpenCRVS: ${response.status} ${response.statusText}`
    )
  }

  const challenge = await response.text()

  if (challenge !== challengeToken) {
    throw new Error(
      `❌ Challenge mismatch. Expected: ${challengeToken}, got: ${challenge}`
    )
  }

  return reply.type('text/plain').status(200).send('Subscribed successfully.')
}
