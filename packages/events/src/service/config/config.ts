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
import { array } from 'zod'
import { EventConfig, getOrThrow, WorkqueueConfig } from '@opencrvs/commons'
import { Bundle, SavedLocation } from '@opencrvs/commons/types'
import { env } from '@events/environment'
import { Location } from '../locations/locations'

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

export async function getWorkqueueConfigurations(token: string) {
  const res = await fetch(new URL('/workqueue', env.COUNTRY_CONFIG_URL), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch workqueue config')
  }

  return array(WorkqueueConfig).parse(await res.json())
}

function parsePartOf(partOf: string | undefined): string | null {
  if (!partOf) {
    return null
  }
  return partOf === 'Location/0' ? null : partOf.split('/')[1]
}

export async function getLocations() {
  const types = ['ADMIN_STRUCTURE', 'CRVS_OFFICE', 'HEALTH_FACILITY']

  const requests = types.map(async (type) => {
    const url = new URL('/locations', env.CONFIG_URL)
    url.searchParams.set('type', type)
    url.searchParams.set('_count', '0')

    return fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })

  const responses = await Promise.all(requests)

  for (const res of responses) {
    if (!res.ok) {
      throw new Error('Failed to fetch locations')
    }
  }

  const results = await Promise.all(
    responses.map(async (res) => res.json() as Promise<Bundle<SavedLocation>>)
  )
  const locations = results
    .flatMap((result) => result.entry.map(({ resource }) => resource))
    .map((entry) => {
      return {
        id: entry.id,
        name: entry.name,
        partOf: parsePartOf(entry.partOf?.reference),
        status: entry.status
      }
    })

  return array(Location).parse(locations)
}
