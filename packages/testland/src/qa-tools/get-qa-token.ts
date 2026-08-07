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
import { AUTH_URL } from '@countryconfig/constants'

// Only NATIONAL_SYSTEM_ADMIN currently holds the `location.edit` scope, so
// the QA tool always authenticates as the seeded testland demo user for
// that role rather than asking for a token. Two-factor auth is disabled in
// this environment, so the verification code is always the fixed '000000'
// (see packages/auth/src/environment.ts).
const QA_TOOL_USERNAME = 'j.campbell'
const QA_TOOL_PASSWORD = 'test'

export async function getQaToken(): Promise<string> {
  const authResponse = await fetch(`${AUTH_URL}/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: QA_TOOL_USERNAME,
      password: QA_TOOL_PASSWORD
    })
  })
  const { nonce } = await authResponse.json()

  const verifyResponse = await fetch(`${AUTH_URL}/verifyCode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nonce, code: '000000' })
  })
  const { token } = await verifyResponse.json()

  return token
}
