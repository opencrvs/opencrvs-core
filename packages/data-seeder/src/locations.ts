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
import { env } from './environment'
import { TypeOf, z } from 'zod'
import { raise } from './utils'
import { fromZodError } from 'zod-validation-error'
import { getUUID } from '@opencrvs/commons'
import { createClient } from '@opencrvs/toolkit/api'

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
  const locations = parsedLocations.data

  const locationIdMap = new Map(locations.map(({ id }) => [id, getUUID()]))

  return locations.map((loc) => ({
    id: locationIdMap.get(loc.id)!,
    name: loc.name,
    parentId: locationIdMap.get(loc.partOf.split('/')[1]) || null,
    locationType: loc.locationType,
    externalId: loc.id,
    validUntil: null
  }))
}

export async function seedLocations(token: string) {
  const locations = await getLocations()

  const url = new URL('events', env.GATEWAY_HOST).toString()
  const client = createClient(url, `Bearer ${token}`)

  return await client.locations.set.mutate(locations)
}
