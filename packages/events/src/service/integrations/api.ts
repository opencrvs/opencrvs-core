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
import { joinUrl } from '@opencrvs/commons'
import { env } from '@events/environment'

interface RegisterSystemPayload {
  name: string
  type: 'CUSTOM'
  scope: string[]
  integratingSystemType?: string
}

interface RegisterSystemResponse {
  clientSecret: string
  system: {
    name: string
    status: string
    type: string
    integratingSystemType?: string
    _id: string
    shaSecret: string
    clientId: string
    settings: {
      webhook: unknown[]
      dailyQuota: number
    }
  }
}

export interface CreateIntegrationResult {
  clientId: string
  shaSecret: string
  clientSecret: string
}

export async function registerSystem(
  payload: RegisterSystemPayload,
  token: string
): Promise<CreateIntegrationResult> {
  const res = await fetch(
    joinUrl(env.USER_MANAGEMENT_URL, 'registerSystem').href,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
  )

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(
      `Unable to register system. Error: ${res.status} - ${errorText}`
    )
  }

  const response = (await res.json()) as RegisterSystemResponse

  return {
    clientId: response.system.clientId,
    shaSecret: response.system.shaSecret,
    clientSecret: response.clientSecret
  }
}
