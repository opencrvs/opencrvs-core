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

import { createAPIClient, getOrThrow } from '@opencrvs/commons'
import { env } from '@events/environment'

const apiClient = createAPIClient(env.COUNTRY_CONFIG_URL)

export function getEventConfigurations(token: string) {
  return apiClient.getEventConfigurations({
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

async function findEventConfigurationById({
  token,
  eventType
}: {
  token: string
  eventType: string
}) {
  const configurations = await getEventConfigurations(token)
  return configurations.find((config) => config.id === eventType)
}

export async function getEventConfigurationById({
  token,
  eventType
}: {
  token: string
  eventType: string
}) {
  return getOrThrow(
    await findEventConfigurationById({
      token,
      eventType
    }),
    `No configuration found for event type: ${eventType}`
  )
}
