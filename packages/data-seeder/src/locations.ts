/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import fetch from 'node-fetch'
import {
  COUNTRY_CONFIG_URL,
  GATEWAY_URL,
  OPENCRVS_SPECIFICATION_URL
} from './constants'
import { z } from 'zod'
import { raise } from './utils'

const LocationSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    alias: z.string(),
    partOf: z.string(),
    locationType: z.enum(['ADMIN_STRUCTURE', 'HEALTH_FACILITY', 'CRVS_OFFICE']),
    jurisdictionType: z
      .enum([
        'STATE',
        'DISTRICT',
        'LOCATION_LEVEL_3',
        'LOCATION_LEVEL_4',
        'LOCATION_LEVEL_5'
      ])
      .optional(),
    statistics: z
      .array(
        z.object({
          year: z.number(),
          male_population: z.number(),
          female_population: z.number(),
          population: z.number(),
          crude_birth_rate: z.number()
        })
      )
      .optional()
  })
)

async function getLocations() {
  const url = new URL('locations', COUNTRY_CONFIG_URL).toString()
  const res = await fetch(url)
  if (!res.ok) {
    raise(`Expected to get the locations from ${url}`)
  }
  const parsedLocations = LocationSchema.safeParse(await res.json())
  if (!parsedLocations.success) {
    raise(parsedLocations.error.issues.toString())
  }
  return parsedLocations.data
}

export async function seedLocations(token: string) {
  const savedLocations = await fetch(`${GATEWAY_URL}/location?_count=0`, {
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })
    .then((res) => res.json())
    .then((bundle: fhir3.Bundle<fhir3.Location>) => {
      return (
        bundle.entry
          ?.map((bundleEntry) => bundleEntry.resource)
          .filter((maybeLocation): maybeLocation is fhir3.Location =>
            Boolean(maybeLocation)
          )
          .map((location) =>
            location.identifier
              ?.find(
                ({ system }) =>
                  system ===
                    `${OPENCRVS_SPECIFICATION_URL}id/statistical-code` ||
                  system === `${OPENCRVS_SPECIFICATION_URL}id/internal-id`
              )
              ?.value?.split('_')
              .pop()
          )
          .filter((maybeId): maybeId is string => Boolean(maybeId)) ?? []
      )
    })
  const savedLocationsSet = new Set(savedLocations)
  const locations = (await getLocations()).filter((location) => {
    if (savedLocationsSet.has(location.id)) {
      console.log(`Location with id "${location.id}" already exists. Skipping`)
    }
    return !savedLocationsSet.has(location.id)
  })
  const res = await fetch(`${GATEWAY_URL}/location?`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json'
    },
    body: JSON.stringify(
      locations
        // statisticalID & code are legacy properties
        .map(({ id, locationType, ...loc }) => ({
          statisticalID: id,
          code: locationType,
          ...loc
        }))
    )
  })
  if (!res.ok) {
    raise(await res.json())
  }
  const response: fhir3.Bundle<fhir3.BundleEntryResponse> = await res.json()
  response.entry?.forEach((res, index) => {
    if (res.response?.status !== '201') {
      console.log(
        `Failed to create location resource for: "${locations[index].name}"`
      )
    }
  })
}
