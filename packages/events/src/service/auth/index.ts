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
import { UUID } from '@opencrvs/commons'
import { env } from '@events/environment'

export async function getAnonymousToken() {
  const res = await fetch(new URL('/anonymous-token', env.AUTH_URL).toString())
  const { token } = await res.json()
  return token as string
}

export async function getActionConfirmationToken(
  { eventId, actionId }: { eventId: UUID; actionId: UUID },
  token: string
) {
  const grantType = 'urn:opencrvs:oauth:grant-type:token-exchange'
  const subject_token_type = 'urn:ietf:params:oauth:token-type:access_token'
  const requested_token_type =
    'urn:opencrvs:oauth:token-type:single_record_token'

  const params = new URLSearchParams({
    grant_type: grantType,
    subject_token: token,
    subject_token_type,
    requested_token_type,
    event_id: eventId,
    action_id: actionId
  })

  const res = await fetch(new URL(`token?${params}`, env.AUTH_URL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    }
  })

  if (!res.ok) {
    throw new Error(
      `Error calling token exchange handler [${res.statusText} ${
        res.status
      }]: ${await res.text()}`
    )
  }

  const { access_token: accessToken } = (await res.json()) as {
    access_token: string
  }
  return accessToken
}
