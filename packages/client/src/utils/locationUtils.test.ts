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
  getJurisidictionType,
  getLocationNameMapOfFacility
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
  describe('getLocationNameMapOfFacility()', () => {
    const locations = {
      'f244b79e-16e7-40b2-834f-c1c57bd7eae8': {
        id: 'f244b79e-16e7-40b2-834f-c1c57bd7eae8',
        name: 'Abwe',
        alias: 'Abwe',
        physicalType: 'Jurisdiction',
        jurisdictionType: 'DISTRICT',
        type: 'ADMIN_STRUCTURE',
        partOf: 'Location/df669feb-61a3-4984-ab24-4b28511b472a'
      },
      'ecc5a78b-e7d9-4640-ac65-e591a6a9590f': {
        id: 'ecc5a78b-e7d9-4640-ac65-e591a6a9590f',
        name: 'Ibombo',
        alias: 'Ibombo',
        physicalType: 'Jurisdiction',
        jurisdictionType: 'DISTRICT',
        type: 'ADMIN_STRUCTURE',
        partOf: 'Location/df669feb-61a3-4984-ab24-4b28511b472a'
      },
      'df669feb-61a3-4984-ab24-4b28511b472a': {
        id: 'df669feb-61a3-4984-ab24-4b28511b472a',
        name: 'Central',
        alias: 'Central',
        physicalType: 'Jurisdiction',
        jurisdictionType: 'STATE',
        type: 'ADMIN_STRUCTURE',
        partOf: 'Location/0'
      }
    }
    it('returns a mapping object of jurisdictionType vs name of a given facility', () => {
      const facilityLocation = {
        id: '5c6abc88-26b8-4834-a1a6-2992807e3a72',
        name: 'ARK Private Clinic',
        alias: 'ARK Private Clinic',
        address: '',
        physicalType: 'Building',
        type: 'HEALTH_FACILITY',
        partOf: 'Location/f244b79e-16e7-40b2-834f-c1c57bd7eae8'
      }

      const map = getLocationNameMapOfFacility(facilityLocation, locations)
      expect(map).toEqual({
        DISTRICT: 'Abwe',
        STATE: 'Central',
        country: undefined,
        facility: 'ARK Private Clinic'
      })
    })
  })
})
