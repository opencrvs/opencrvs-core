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

import { OPENCRVS_SPECIFICATION_URL } from '@gateway/features/fhir/constants'
import { fetchFromHearth } from '@gateway/features/fhir/utils'
import {
  ExtensionUrl,
  Facility,
  Location,
  LocationStatistic,
  Statistics
} from './locationHandler'

export const composeFhirLocation = (
  location: Location | Facility
): fhir.Location => {
  if ('statistics' in location) {
    return {
      resourceType: 'Location',
      identifier: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}id/statistical-code`,
          value: `ADMIN_STRUCTURE_${String(location.statisticalID)}`
        },
        {
          system: `${OPENCRVS_SPECIFICATION_URL}id/jurisdiction-type`,
          value: location.jurisdictionType
        }
      ],
      name: location.name,
      alias: [location.name],
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
            display: `'Jurisdiction'`
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
      alias: [location.name],
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
      },
      telecom: [],
      address: {
        line: [],
        district: location.district,
        state: location.state
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
  const extensions: fhir.Extension[] = [
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
  extension: fhir.Extension[]
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
  const locationSearchResult = await fetchFromHearth(
    `/Location/?identifier=${identifier}&_count=0`
  )

  return (
    (locationSearchResult &&
      locationSearchResult.entry &&
      locationSearchResult.entry.map(
        (locationEntry: fhir.BundleEntry) =>
          locationEntry.resource as fhir.Location
      )) ||
    []
  )
}
