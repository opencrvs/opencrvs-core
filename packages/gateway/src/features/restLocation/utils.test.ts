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

import { cloneDeep } from 'lodash'
import { mockFhirLocation } from '@gateway/utils/testUtils'
import {
  generateStatisticalExtensions,
  updateStatisticalExtensions
} from '@gateway/features/restLocation/utils'

describe('location utils function testing', () => {
  describe('generateStatisticalExtensions()', () => {
    it('generate statistical extensions for location', async () => {
      const mockFhirLocationCloned = cloneDeep(mockFhirLocation)
      const extentions = await generateStatisticalExtensions([
        {
          year: 2020,
          male_population: 372995,
          female_population: 329978,
          population: 702973,
          crude_birth_rate: 13.675
        },
        {
          year: 2021,
          male_population: 387162,
          female_population: 299071,
          population: 686234,
          crude_birth_rate: 13.975
        }
      ])
      expect(mockFhirLocationCloned.extension).toEqual(extentions)
    })
  })
  describe('updateStatisticalExtensions()', () => {
    it('update statistical extension', async () => {
      const extentions = await updateStatisticalExtensions(
        {
          year: 2021,
          male_population: 1234,
          female_population: 4321,
          population: 5555,
          crude_birth_rate: 2.0
        },
        mockFhirLocation.extension as any
      )
      expect(extentions).toEqual([
        {
          url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
          valueAttachment: {
            contentType: 'application/geo+json',
            data: '<base64>'
          }
        },
        {
          url: 'http://opencrvs.org/specs/id/statistics-male-populations',
          valueString: '[{"2020":372995},{"2021":1234}]'
        },
        {
          url: 'http://opencrvs.org/specs/id/statistics-female-populations',
          valueString: '[{"2020":329978},{"2021":4321}]'
        },
        {
          url: 'http://opencrvs.org/specs/id/statistics-total-populations',
          valueString: '[{"2020":702973},{"2021":5555}]'
        },
        {
          url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
          valueString: '[{"2020":6.8375},{"2021":1}]'
        }
      ])
    })
    it('if not exist add data to statistical extention', async () => {
      const extentions = await updateStatisticalExtensions(
        {
          year: 2022,
          male_population: 1000,
          female_population: 2000,
          population: 3000,
          crude_birth_rate: 1.5
        },
        mockFhirLocation.extension as any
      )
      expect(extentions).toEqual([
        {
          url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
          valueAttachment: {
            contentType: 'application/geo+json',
            data: '<base64>'
          }
        },
        {
          url: 'http://opencrvs.org/specs/id/statistics-male-populations',
          valueString: '[{"2020":372995},{"2021":387162},{"2022":1000}]'
        },
        {
          url: 'http://opencrvs.org/specs/id/statistics-female-populations',
          valueString: '[{"2020":329978},{"2021":299071},{"2022":2000}]'
        },
        {
          url: 'http://opencrvs.org/specs/id/statistics-total-populations',
          valueString: '[{"2020":702973},{"2021":686234},{"2022":3000}]'
        },
        {
          url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
          valueString: '[{"2020":6.8375},{"2021":6.9875},{"2022":0.75}]'
        }
      ])
    })
  })
})
