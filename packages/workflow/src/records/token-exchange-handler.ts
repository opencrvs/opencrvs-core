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
import { AUTH_URL } from '@workflow/constants'
import fetch from 'node-fetch'

export async function tokenExchangeHandler(
  token: string,
  headers: Record<string, string>,
  recordId: string
) {
  const grantType = 'urn:opencrvs:oauth:grant-type:token-exchange'
  const subject_token_type = 'urn:ietf:params:oauth:token-type:access_token'
  const requested_token_type =
    'urn:opencrvs:oauth:token-type:single_record_token'

  const authUrl = new URL(
    `token?grant_type=${grantType}&subject_token=${token}&subject_token_type=${subject_token_type}&requested_token_type=${requested_token_type}&record_id=${recordId}`,
    AUTH_URL
  )

  const res = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  })

  if (!res.ok) {
    throw new Error(
      `Error calling token exchange handler [${res.statusText} ${
        res.status
      }]: ${await res.text()}`
    )
  }
  return (await res.json()) as { access_token: string }
}
