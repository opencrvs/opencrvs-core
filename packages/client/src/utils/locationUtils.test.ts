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
  getJurisidictionType,
  getOfficeLocations
} from '@client/utils/locationUtils'

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
        '123',
        {
          language: 'en',
          role: 'FIELD_AGENT',
          localRegistrar: {
            name: []
          }
        }
      )

      expect(locations['111']).toBeDefined()
      expect(locations['333']).toBeDefined()
      expect(locations['222']).not.toBeDefined()
    })

    it('filters facilities for sysadmin', () => {
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
            type: 'CRVS_OFFICE',
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
        '123',
        {
          language: 'en',
          role: 'LOCAL_SYSTEM_ADMIN',
          localRegistrar: {
            name: []
          }
        }
      )

      expect(locations['111']).toBeDefined()
      expect(locations['333']).toBeDefined()
      expect(locations['222']).toBeDefined()
    })

    it('gets crvs office for sysadmin', () => {
      const locations = getOfficeLocations({
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
          type: 'CRVS_OFFICE',
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
      })

      expect(locations).toStrictEqual([
        {
          id: '222',
          searchableText: 'Test',
          displayLabel: 'Test'
        }
      ])
    })
  })

  describe('getJurisidictionType()', () => {
    it('returns jurisdiction tyoe for location with provided id', () => {
      const locations = mockOfflineData.locations
      const locationId = '65cf62cb-864c-45e3-9c0d-5c70f0074cb4'

      expect(getJurisidictionType(locations, locationId)).toEqual('DIVISION')
    })
  })
})
