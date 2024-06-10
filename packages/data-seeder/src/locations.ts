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
import { COUNTRY_CONFIG_HOST, GATEWAY_HOST } from './constants'
import { z } from 'zod'
import { raise } from './utils'
import { inspect } from 'util'
import {
  SavedBundle,
  Location,
  findStatisticalId,
  SavedLocation,
  resourceIdentifierToUUID
} from '@opencrvs/commons/types'
import chalk from 'chalk'

const LocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  alias: z.string().optional(),
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
    .optional(),
  status: z.enum(['active', 'inactive']).optional()
})

type CountryConfigLocation = z.infer<typeof LocationSchema>

function validateAdminStructure(locations: Array<CountryConfigLocation>) {
  const statisticsErrors = new Array<Error>()
  const locationsMap = new Map(
    locations.map(({ statistics, ...loc }) => {
      if (!statistics) {
        statisticsErrors.push(
          new Error(`No statistics data given for location: ${loc.name}`)
        )
      }
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

  function validateTree(root: string) {
    const node = locationNodeMap.get(root)!
    const location = locationsMap.get(node.id)!
    const childLocations = node.children.map(
      (child) => locationsMap.get(child)!
    )
    const accumulatedStatistics = new Map<
      number,
      { male_population: number; female_population: number; population: number }
    >()
    for (const [year, parentStats] of location.statistics.entries()) {
      if (
        parentStats.population <
        parentStats.male_population + parentStats.female_population
      ) {
        statisticsErrors.push(
          new Error(
            `Location: ${
              location.name
            }, year: ${year} -> Sum of male population and female population ${
              parentStats.male_population + parentStats.female_population
            } is higher than the total population ${parentStats.population}`
          )
        )
      }
      childLocations.forEach((childLocation) => {
        if (!childLocation.statistics.get(year)) {
          statisticsErrors.push(
            new Error(
              `Couldn't find child location data: ${childLocation.name}, year: ${year} -> but that year's data exists for parent: ${location.name}`
            )
          )
        }
        const currentStats = accumulatedStatistics.get(year) ?? {
          male_population: 0,
          female_population: 0,
          population: 0
        }
        const childStats = childLocation.statistics.get(year) ?? {
          male_population: 0,
          female_population: 0,
          population: 0
        }

        accumulatedStatistics.set(year, {
          male_population:
            currentStats.male_population + childStats.male_population,
          female_population:
            currentStats.female_population + childStats.female_population,
          population: currentStats.population + childStats.population
        })
      })
      if (childLocations.length > 0) {
        const sumPopulation = accumulatedStatistics.get(year)!.population
        if (sumPopulation > parentStats.population) {
          statisticsErrors.push(
            new Error(
              `Location: ${location.name}, year: ${year} -> Sum of child locations' population ${sumPopulation} is greater than the total population ${parentStats.population}, The total population should be >= ${sumPopulation}`
            )
          )
        }
      }
    }
  }
  locationNodeMap.get('0')!.children.forEach((childId) => validateTree(childId))
  if (statisticsErrors.length > 0) {
    raise(statisticsErrors.map((error) => error.message).join('\n'))
  }
  return locationsMap
}

export async function fetchLocationsFromCountryConfig() {
  const url = new URL('locations', COUNTRY_CONFIG_HOST).toString()
  const res = await fetch(url)
  if (!res.ok) {
    raise(`Expected to get the locations from ${url}`)
  }
  const parsedLocations = z.array(LocationSchema).safeParse(await res.json())

  if (!parsedLocations.success) {
    raise(
      `Error when getting locations from country-config: ${inspect(
        parsedLocations.error.issues
      )}`
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

export const fetchAllSavedLocations = async () => {
  const allBundles = await Promise.all<SavedBundle<Location>>(
    ['ADMIN_STRUCTURE', 'CRVS_OFFICE', 'HEALTH_FACILITY'].map((type) =>
      fetch(`${GATEWAY_HOST}/locations?type=${type}&_count=0`, {
        headers: {
          'Content-Type': 'application/fhir+json'
        }
      }).then((res) => res.json())
    )
  )

  return allBundles.flatMap(({ entry }) =>
    entry.map(({ resource }) => resource)
  )
}

const formatCreateCountryConfigLocation = ({
  id,
  locationType,
  ...loc
}: CountryConfigLocation) => ({
  statisticalID: id,
  code: locationType,
  ...loc
})

const postNewLocations = async (
  locations: Array<CountryConfigLocation>,
  { token }: { token: string }
) => {
  const res = await fetch(`${GATEWAY_HOST}/locations?`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json'
    },
    body: JSON.stringify(
      locations.map((location) => formatCreateCountryConfigLocation(location))
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

const updateLocation = async (
  /** @type UUID */
  locationId: string,
  location: Partial<CountryConfigLocation>,
  { token }: { token: string }
) => {
  const res = await fetch(`${GATEWAY_HOST}/locations/${locationId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json'
    },
    body: JSON.stringify(location)
  })

  if (!res.ok) {
    raise(await res.text())
  }

  return { status: 'ok' }
}
const diffLocations = (
  countryConfigLocationsMap: Map<string, CountryConfigLocation>,
  savedLocationsMap: Map<string, SavedLocation>
) => {
  const locationsToUpdate: Map<
    string,
    Partial<CountryConfigLocation>
  > = new Map()

  for (const [savedLocationStatisticalId, savedLocation] of savedLocationsMap) {
    const countryConfigLocation = countryConfigLocationsMap.get(
      savedLocationStatisticalId
    )

    if (!countryConfigLocation && savedLocation.status === 'active') {
      console.info(
        `> ${chalk.whiteBright(
          `${savedLocation.name}:`
        )} setting the status to inactive`
      )

      locationsToUpdate.set(savedLocation.id, {
        status: 'inactive'
      })

      continue
    }

    // Already set to inactive, ignoring...
    if (!countryConfigLocation) continue

    if (countryConfigLocation.name !== savedLocation.name) {
      console.info(
        `> ${chalk.whiteBright(`${savedLocation.name}:`)} updating name "${
          savedLocation.name
        }" to "${countryConfigLocation.name}"`
      )
      locationsToUpdate.set(savedLocation.id, countryConfigLocation)
    }

    if (countryConfigLocation.alias !== savedLocation.alias?.[0]) {
      console.info(
        `> ${chalk.whiteBright(`${savedLocation.name}:`)} updating alias "${
          savedLocation.alias
        }" to "${countryConfigLocation.alias}"`
      )
      locationsToUpdate.set(savedLocation.id, countryConfigLocation)
    }

    const countryConfigLocationPartOfReference = countryConfigLocationsMap.get(
      savedLocationStatisticalId
    )?.partOf

    const oldReferenceUuid = savedLocationsMap.get(
      countryConfigLocationPartOfReference!.split('/')[1]
    )?.id

    const newReferenceUuid =
      savedLocation.partOf &&
      resourceIdentifierToUUID(savedLocation.partOf.reference)

    if (
      oldReferenceUuid &&
      newReferenceUuid &&
      oldReferenceUuid !== newReferenceUuid
    ) {
      console.info(
        `> ${chalk.whiteBright(
          `${savedLocation.name}:`
        )} updating partOf "${oldReferenceUuid}" to "${newReferenceUuid}"`
      )

      throw new Error('Updating partOf not supported yet.')

      //locationsToUpdate.set(savedLocationStatisticalId, countryConfigLocation)
    }
  }

  return locationsToUpdate
}

export async function seedLocations(token: string) {
  const savedLocations = await fetchAllSavedLocations()
  const countryConfigLocations = await fetchLocationsFromCountryConfig()
  const countryConfigLocationsMap = new Map(
    countryConfigLocations.map((location) => [location.id, location])
  )
  const savedLocationsMap = new Map(
    savedLocations.map((location) => [findStatisticalId(location)!, location])
  )

  /*
   * New locations found
   */
  const unsavedLocations = countryConfigLocations.filter(
    (location) => !savedLocationsMap.has(location.id)
  )

  if (unsavedLocations.length > 0) {
    console.info(`> inserting ${unsavedLocations.length} new locations...`)
    await postNewLocations(unsavedLocations, { token })
  }

  /*
   * Installing for first time, nothing could have changed
   */
  if (savedLocations.length === 0) {
    console.info(`> ...done`)
    return
  }

  /*
   * Update saved locations
   */
  const updatedLocations = diffLocations(
    countryConfigLocationsMap,
    savedLocationsMap
  )
  console.info(`> updating ${updatedLocations.size} locations`)

  for (const [locationId, location] of updatedLocations) {
    await updateLocation(locationId, location, { token })
  }

  console.info(`> ...done`)
}
