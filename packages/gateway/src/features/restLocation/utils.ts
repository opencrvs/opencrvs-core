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

import { OPENCRVS_SPECIFICATION_URL } from '@gateway/features/fhir/constants'
import { fetchFromHearth } from '@gateway/features/fhir/utils'
import {
  ExtensionUrl,
  Facility as FacilityInput,
  Location as LocationInput,
  JurisdictionType,
  LocationStatistic,
  Statistics
} from './locationHandler'
import { Location, Extension, Bundle } from '@opencrvs/commons/types'

export const composeFhirLocation = (
  location: LocationInput | FacilityInput
): Location => {
  if (location.code === 'ADMIN_STRUCTURE') {
    return {
      resourceType: 'Location',
      identifier: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}id/statistical-code`,
          value: `ADMIN_STRUCTURE_${String(location.statisticalID)}`
        },
        {
          system: `${OPENCRVS_SPECIFICATION_URL}id/jurisdiction-type`,
          value:
            location.jurisdictionType === JurisdictionType.LOCATION_LEVEL_1
              ? JurisdictionType.STATE
              : location.jurisdictionType === JurisdictionType.LOCATION_LEVEL_2
              ? JurisdictionType.DISTRICT
              : location.jurisdictionType
        }
      ],
      name: location.name,
      alias: location.alias ? [location.alias] : [],
      description: location.statisticalID,
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
          value: `${location.code}_${String(location.statisticalID)}`
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
            code: location.code
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

export function setExtensions(
  malePopulations: Statistics,
  femalePopulations: Statistics,
  totalPopulations: Statistics,
  birthRates: Statistics
) {
  const extensions: Extension[] = [
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

export function updateStatisticalExtensions(
  sourceStatistic: LocationStatistic,
  extension: Extension[]
) {
  let malePopulations: Statistics = []
  let femalePopulations: Statistics = []
  let totalPopulations: Statistics = []
  let birthRates: Statistics = []

  for (const data of extension) {
    if (data.url === ExtensionUrl.MALE_POPULATION) {
      malePopulations = JSON.parse(data.valueString!)
      const previousData = malePopulations.find((year) =>
        Boolean(year[sourceStatistic.year])
      )
      if (previousData) {
        previousData[sourceStatistic.year] = sourceStatistic.male_population
      } else {
        malePopulations.push({
          [sourceStatistic.year]: sourceStatistic.male_population
        })
      }
    } else if (data.url === ExtensionUrl.FEMALE_POPULATION) {
      femalePopulations = JSON.parse(data.valueString!)
      const previousData = femalePopulations.find((year) =>
        Boolean(year[sourceStatistic.year])
      )
      if (previousData) {
        previousData[sourceStatistic.year] = sourceStatistic.female_population
      } else {
        femalePopulations.push({
          [sourceStatistic.year]: sourceStatistic.female_population
        })
      }
    } else if (data.url === ExtensionUrl.TOTAL_POPULATION) {
      totalPopulations = JSON.parse(data.valueString!)
      const previousData = totalPopulations.find((year) =>
        Boolean(year[sourceStatistic.year])
      )
      if (previousData) {
        previousData[sourceStatistic.year] = sourceStatistic.population
      } else {
        totalPopulations.push({
          [sourceStatistic.year]: sourceStatistic.population
        })
      }
    } else if (data.url === ExtensionUrl.CRUDE_BIRTH_RATE) {
      birthRates = JSON.parse(data.valueString!)
      const previousData = birthRates.find((year) =>
        Boolean(year[sourceStatistic.year])
      )
      if (previousData) {
        previousData[sourceStatistic.year] =
          sourceStatistic.crude_birth_rate / 2
      } else {
        birthRates.push({
          [sourceStatistic.year]: sourceStatistic.crude_birth_rate / 2
        })
      }
    }
  }

  return setExtensions(
    malePopulations,
    femalePopulations,
    totalPopulations,
    birthRates
  )
}

export async function getLocationsByIdentifier(identifier: string) {
  const locationSearchResult = await fetchFromHearth<Bundle<Location>>(
    `/Location/?identifier=${identifier}&_count=0`
  )

  return (
    (locationSearchResult &&
      locationSearchResult.entry &&
      locationSearchResult.entry.map(
        (locationEntry) => locationEntry.resource as Location
      )) ||
    []
  )
}
