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
import { env } from '@user-mgnt/environment'
import { EventConfig, joinURL } from '@opencrvs/commons'
import fetch from 'node-fetch'

export async function getEventConfigurations(authorization: string) {
  const url = joinURL(env.COUNTRY_CONFIG_URL, '/events')

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization
    }
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch event configurations: ${res.statusText}`)
  }

  const json = await res.json()
  return json as EventConfig[]
}
