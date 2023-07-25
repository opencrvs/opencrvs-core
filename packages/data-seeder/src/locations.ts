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
  HEARTH_URL,
  OPENCRVS_SPECIFICATION_URL
} from './constants'
import { TypeOf, z } from 'zod'
import { raise } from './utils'
import { v4 as uuid } from 'uuid'

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

type LocationResponse = TypeOf<typeof LocationSchema>[number]

export const composeFhirLocation = (
  location: LocationResponse
): fhir3.Location => {
  if (location.locationType === 'ADMIN_STRUCTURE') {
    return {
      resourceType: 'Location',
      identifier: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}id/statistical-code`,
          value: `ADMIN_STRUCTURE_${String(location.id)}`
        },
        {
          system: `${OPENCRVS_SPECIFICATION_URL}id/jurisdiction-type`,
          value: location.jurisdictionType
        }
      ],
      name: location.name,
      alias: location.alias ? [location.alias] : [],
      description: location.id,
      status: 'active',
      mode: 'instance',
      partOf: {
        reference: location.partOf
      },
      type: {
        coding: [
          {
            system: `${OPENCRVS_SPECIFICATION_URL}location-type`,
            code: 'ADMIN_STRUCTURE'
          }
        ]
      },
      physicalType: {
        coding: [
          {
            code: 'jdn',
            display: 'Jurisdiction'
          }
        ]
      }
    }
  } else {
    return {
      resourceType: 'Location',
      identifier: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}id/internal-id`,
          value: `${location.locationType}_${String(location.id)}`
        }
      ],
      name: location.name,
      alias: location.alias ? [location.alias] : [],
      status: 'active',
      mode: 'instance',
      partOf: {
        reference: location.partOf
      },
      type: {
        coding: [
          {
            system: `${OPENCRVS_SPECIFICATION_URL}location-type`,
            code: location.locationType
          }
        ]
      },
      physicalType: {
        coding: [
          {
            code: 'bu',
            display: 'Building'
          }
        ]
      }
    }
  }
}

type LocationStatistic = {
  year: number
  male_population: number
  female_population: number
  population: number
  crude_birth_rate: number
}

type Statistics = Array<Record<number, number>>

export function setExtensions(
  malePopulations: Statistics,
  femalePopulations: Statistics,
  totalPopulations: Statistics,
  birthRates: Statistics
) {
  const extensions: fhir3.Extension[] = [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
      valueAttachment: {
        contentType: 'application/geo+json',
        data: '<base64>' // base64 encoded geoJSON feature object
      }
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-male-populations',
      valueString: JSON.stringify(malePopulations)
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-female-populations',
      valueString: JSON.stringify(femalePopulations)
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-total-populations',
      valueString: JSON.stringify(totalPopulations)
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
      valueString: JSON.stringify(birthRates)
    }
  ]
  return extensions
}

export function generateStatisticalExtensions(
  sourceStatistic: LocationStatistic[]
) {
  const malePopulations: Statistics = []
  const femalePopulations: Statistics = []
  const totalPopulations: Statistics = []
  const birthRates: Statistics = []

  for (const data of sourceStatistic) {
    femalePopulations.push({
      [data.year]: data.female_population
    })
    malePopulations.push({
      [data.year]: data.male_population
    })
    totalPopulations.push({
      [data.year]: data.population
    })
    birthRates.push({
      [data.year]: data.crude_birth_rate / 2
    })
  }

  return setExtensions(
    malePopulations,
    femalePopulations,
    totalPopulations,
    birthRates
  )
}

async function buildLocationBundle(
  locations: LocationResponse[]
): Promise<fhir3.Bundle<fhir3.Location>> {
  const locationsMap = new Map(
    locations.map((location) => [
      location.id,
      { ...location, uid: `urn:uuid:${uuid()}` }
    ])
  )
  fetch(`${HEARTH_URL}/Location?_count=0`, {
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })
  const savedLocations = await fetch(`${HEARTH_URL}/Location?_count=0`, {
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
  return {
    resourceType: 'Bundle',
    type: 'document',
    entry: locations
      .filter((location) => !savedLocationsSet.has(location.id))
      .map((location) => ({
        ...location,
        // partOf is either Location/{statisticalID} of another location or 'Location/0'
        partOf:
          locationsMap.get(location.partOf.split('/')[1])?.uid ??
          location.partOf
      }))
      .map(
        (location): fhir3.BundleEntry<fhir3.Location> => ({
          fullUrl: locationsMap.get(location.id)!.uid,
          resource: {
            ...composeFhirLocation(location),
            ...(location.statistics && {
              extension: generateStatisticalExtensions(location.statistics)
            })
          }
        })
      )
  }
}

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

export async function seedLocations() {
  const locations = await getLocations()
  const locationsBundle = await buildLocationBundle(locations)
  const res = await fetch(HEARTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/fhir+json'
    },
    body: JSON.stringify(locationsBundle)
  })
  if (!res.ok) {
    raise(await res.json())
  }
}
