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

import { env } from '@events/environment'
import {
  ActionInput,
  EventConfig,
  EventDocument,
  getOrThrow,
  logger
} from '@opencrvs/commons'
import fetch from 'node-fetch'
import { array } from 'zod'

export async function getEventConfigurations(token: string) {
  const res = await fetch(new URL('/events', env.COUNTRY_CONFIG_URL), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch events config')
  }

  return array(EventConfig).parse(await res.json())
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

const ActionConfirmationHandlerResponse = {
  FAIL_IN_UNCONTROLLED_MANNER: 500, // Endpoint fails in an uncontrolled manner
  ACTION_REJECTED: 400, // Synchronous flow failed
  SUCCESS: 200, // Synchronous flow succeeded
  REQUIRES_PROCESSING: 202 // Asynchronous flow succeeded, this expects that either the confirm or reject callback is called
} as const

// TODO CIHAN: tää vois lukea yllä olevan enumi
export async function notifyOnAction(
  action: ActionInput,
  event: EventDocument,
  token: string
) {
  try {
    await fetch(
      new URL(
        `/events/${event.type}/actions/${action.type}`,
        env.COUNTRY_CONFIG_URL
      ),
      {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      }
    )
  } catch (error) {
    logger.error(error)
  }
}
