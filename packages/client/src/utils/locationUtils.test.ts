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
import { mockOfflineData } from '@client/tests/util'
import {
  filterLocations,
  generateLocationName,
  getJurisidictionType
} from '@client/utils/locationUtils'
import { LocationType } from '@client/offline/reducer'
import { createIntl } from 'react-intl'
import { ILanguage } from '@client/i18n/reducer'

describe('locationUtil tests', () => {
  describe('filterLocations()', () => {
    it('filters locations to only that partOf a parent location', () => {
      const locations = filterLocations(
        {
          '111': {
            id: '111',
            name: 'Test',
            alias: 'Test',
            physicalType: 'Jurisdiction',
            type: 'ADMIN_STRUCTURE',
            partOf: 'Location/123'
          },
          '222': {
            id: '222',
            name: 'Test',
            alias: 'Test',
            physicalType: 'Jurisdiction',
            type: 'ADMIN_STRUCTURE',
            partOf: 'Location/321'
          },
          '333': {
            id: '333',
            name: 'Test',
            alias: 'Test',
            physicalType: 'Jurisdiction',
            type: 'ADMIN_STRUCTURE',
            partOf: 'Location/123'
          }
        },
        LocationType.ADMIN_STRUCTURE,
        {
          locationLevel: 'partOf',
          locationId: 'Location/123'
        }
      )

      expect(locations['111']).toBeDefined()
      expect(locations['333']).toBeDefined()
      expect(locations['222']).not.toBeDefined()
    })

    it('filters offices without any part of location', () => {
      const locations = filterLocations(
        {
          '111': {
            id: '111',
            name: 'Test',
            alias: 'Test',
            physicalType: 'Jurisdiction',
            type: 'CRVS_OFFICE',
            partOf: 'Location/123'
          },
          '222': {
            id: '222',
            name: 'Test',
            alias: 'Test',
            physicalType: 'Jurisdiction',
            type: 'CRVS_OFFICE',
            partOf: 'Location/321'
          },
          '333': {
            id: '333',
            name: 'Test',
            alias: 'Test',
            physicalType: 'Jurisdiction',
            type: 'CRVS_OFFICE',
            partOf: 'Location/123'
          }
        },
        LocationType.CRVS_OFFICE,
        {
          locationLevel: 'partOf'
        }
      )

      expect(locations['111']).toBeDefined()
      expect(locations['333']).toBeDefined()
      expect(locations['222']).toBeDefined()
    })
  })

  describe('getJurisidictionType()', () => {
    it('returns jurisdiction tyoe for location with provided id', () => {
      const locations = mockOfflineData.locations
      const locationId = '65cf62cb-864c-45e3-9c0d-5c70f0074cb4'

      expect(getJurisidictionType(locations, locationId)).toEqual('DIVISION')
    })
  })

  describe('generateLocationName()', () => {
    it('returns the location name with the jurisdiction concatenated at the end', () => {
      const locationId = '81317429-1d89-42ac-8abc-7a92f268273c'
      const location = mockOfflineData.locations[locationId]
      const language: ILanguage = mockOfflineData.languages[0]

      const intl = createIntl({
        locale: language.lang,
        messages: language.messages
      })

      expect(generateLocationName(location, intl)).toEqual('Lusaka District')
    })
    it('returns only the location name if there is no jurisdictionType', () => {
      const officeId = '0d8474da-0361-4d32-979e-af91f012340a'
      const office = mockOfflineData.offices[officeId]
      const language: ILanguage = mockOfflineData.languages[0]

      const intl = createIntl({
        locale: language.lang,
        messages: language.messages
      })

      expect(generateLocationName(office, intl)).toEqual(
        'Moktarpur Union Parishad'
      )
    })
  })
  it('returns empty location name if location is undefined', () => {
    const language: ILanguage = mockOfflineData.languages[0]
    const intl = createIntl({
      locale: language.lang,
      messages: language.messages
    })
    expect(generateLocationName(undefined, intl)).toEqual('')
  })
})
