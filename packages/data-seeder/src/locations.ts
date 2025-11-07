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
import { OPENCRVS_SPECIFICATION_URL } from './constants'
import { env } from './environment'
import { TypeOf, z } from 'zod'
import { raise } from './utils'
import { fromZodError } from 'zod-validation-error'

const LOCATION_TYPES = [
  'ADMIN_STRUCTURE',
  'HEALTH_FACILITY',
  'CRVS_OFFICE'
] as const

const LocationSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    alias: z.string().optional(),
    partOf: z.string(),
    locationType: z.enum(LOCATION_TYPES),
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

function validateAdminStructure(locations: TypeOf<typeof LocationSchema>) {
  const locationsMap = new Map(
    locations.map(({ statistics, ...loc }) => {
      return [
        loc.id,
        {
          ...loc,
          statistics: new Map(
            (statistics ?? []).map(({ year, ...stats }) => [year, stats])
          )
        }
      ]
    })
  )

  // Create a map of parent-child relationships
  const locationNodeMap = new Map(
    locations.map((loc) => [
      loc.id,
      { id: loc.id, children: new Array<string>() }
    ])
  )
  // this is the root location
  locationNodeMap.set('0', { id: '0', children: [] })
  locations.forEach((loc) => {
    const parent = locationNodeMap.get(loc.partOf.split('/')[1])
    if (!parent) {
      raise(`Parent location "${loc.partOf}" not found for ${loc.name}`)
    }
    parent.children.push(loc.id)
  })

  // Validate statistics only for top-level locations (states)
  const statisticsErrors: Error[] = []
  locationNodeMap.get('0')!.children.forEach((stateId) => {
    const state = locationsMap.get(stateId)!
    if (!state.statistics || state.statistics.size === 0) {
      statisticsErrors.push(
        new Error(
          `Top-level location (state) "${state.name}" must have statistics data`
        )
      )
      return
    }

    // Validate statistics data for the state
    for (const [year, stats] of state.statistics.entries()) {
      if (stats.population < stats.male_population + stats.female_population) {
        statisticsErrors.push(
          new Error(
            `Location: ${state.name}, year: ${year} -> Sum of male population and female population ${
              stats.male_population + stats.female_population
            } is higher than the total population ${stats.population}`
          )
        )
      }
    }
  })

  if (statisticsErrors.length > 0) {
    raise(statisticsErrors.map((error) => error.message).join('\n'))
  }

  return locationsMap
}

async function getLocations() {
  const url = new URL('locations', env.COUNTRY_CONFIG_HOST).toString()
  const res = await fetch(url)
  if (!res.ok) {
    raise(`Expected to get the locations from ${url}`)
  }
  const parsedLocations = LocationSchema.safeParse(await res.json())
  if (!parsedLocations.success) {
    raise(
      fromZodError(parsedLocations.error, {
        prefix: `Error validating locations data returned from ${url}`
      })
    )
  }
  const adminStructureMap = validateAdminStructure(
    parsedLocations.data.filter(
      ({ locationType }) => locationType === 'ADMIN_STRUCTURE'
    )
  )
  parsedLocations.data
    .filter(({ locationType }) => locationType !== 'ADMIN_STRUCTURE')
    .forEach((facilityOrOffice) => {
      if (!adminStructureMap.get(facilityOrOffice.partOf.split('/')[1])) {
        raise(
          `Parent location "${facilityOrOffice.partOf}" not found for ${facilityOrOffice.name}`
        )
      }
    })
  return parsedLocations.data
}

const bundleToLocationEntries = (bundle: fhir3.Bundle<fhir3.Location>) =>
  (bundle.entry ?? [])
    .map((bundleEntry) => bundleEntry.resource)
    .filter((maybeLocation): maybeLocation is fhir3.Location =>
      Boolean(maybeLocation)
    )

function locationBundleToIdentifier(
  bundle: fhir3.Bundle<fhir3.Location>
): string[] {
  return bundleToLocationEntries(bundle)
    .map((location) => getExternalIdFromIdentifier(location.identifier))
    .filter((maybeId): maybeId is string => Boolean(maybeId))
}

/**
 * Get the externally defined id for location. Defined in country-config.
 */

const getExternalIdFromIdentifier = (
  identifiers: fhir3.Location['identifier']
) =>
  identifiers
    ?.find(({ system }) =>
      [
        `${OPENCRVS_SPECIFICATION_URL}id/statistical-code`,
        `${OPENCRVS_SPECIFICATION_URL}id/internal-id`
      ].some((identifierSystem) => identifierSystem === system)
    )
    ?.value?.split('_')
    .pop()

export async function seedLocations(token: string) {
  const savedLocations = (
    await Promise.all(
      LOCATION_TYPES.map((type) =>
        getLocationsByType(type)
          .then((res) => res.json())
          .then((bundle: fhir3.Bundle<fhir3.Location>) =>
            locationBundleToIdentifier(bundle)
          )
      )
    )
  ).flat()

  const savedLocationsSet = new Set(savedLocations)
  const locations = (await getLocations()).filter((location) => {
    return !savedLocationsSet.has(location.id)
  })
  const res = await fetch(`${env.GATEWAY_HOST}/locations?`, {
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
    raise(await res.text())
  }

  const response: fhir3.Bundle<fhir3.BundleEntryResponse> = await res.json()
  response.entry?.forEach((res, index) => {
    if (res.response?.status !== '201') {
      // eslint-disable-next-line no-console
      console.log(
        `Failed to create location resource for: "${locations[index].name}"`
      )
    }
  })
}

function getLocationsByType(type: string) {
  return fetch(`${env.GATEWAY_HOST}/locations?type=${type}&_count=0`, {
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })
}
