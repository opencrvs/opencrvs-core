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
import {
  eventLocationNameQueryOfflineTransformer,
  identityToFieldTransformer,
  SectionId
} from '@client/forms/register/mappings/query/field-mappings'
import { IFormField } from '@client/forms'
import { mockOfflineDataWithLocationHierarchy } from '@client/tests/mock-offline-data'

describe('Query FieldMapping', () => {
  it('Should return valid data', () => {
    const factory = identityToFieldTransformer('id', 'nationalId')
    const expectedResult = {}
    const queryData = {
      id: '12345',
      mother: {}
    }
    const sectionId = 'mother' as SectionId
    const field = {} as IFormField
    const transformedData = {}
    const result = factory(
      transformedData,
      queryData,
      sectionId,
      field as IFormField
    )

    expect(result).toEqual(expectedResult)
  })

  it('Should return a new ', () => {
    const factory = identityToFieldTransformer('id', 'nationalId')
    const expectedResult = { mother: { nationalId: '151515' } }
    const queryData = {
      id: '12345',
      mother: {
        identifier: [
          {
            type: 'nationalId',
            id: '151515'
          }
        ]
      }
    }
    const sectionId = 'mother' as SectionId
    const field = { name: 'nationalId' } as IFormField
    const transformedData = {
      mother: {}
    }
    const result = factory(
      transformedData,
      queryData,
      sectionId,
      field as IFormField
    )

    expect(result).toEqual(expectedResult)
  })

  it('should transform one input to multiple output field', () => {
    const factory = eventLocationNameQueryOfflineTransformer(
      'facilities',
      'placeOfBirth'
    )
    const expectedResult = {
      template: {
        placeOfBirth: [
          'ARK Private Clinic',
          'Abwe',
          'Central',
          {
            defaultMessage: 'Bangladesh',
            description: 'ISO Country: BGD',
            id: 'countries.BGD'
          }
        ],
        placeOfBirthCountry: {
          defaultMessage: 'Bangladesh',
          description: 'ISO Country: BGD',
          id: 'countries.BGD'
        },
        placeOfBirthDistrict: 'Abwe',
        placeOfBirthFacility: 'ARK Private Clinic',
        placeOfBirthState: 'Central'
      }
    }

    const queryData = {
      id: '12356',
      eventLocation: {
        id: '5c6abc88-26b8-4834-a1a6-2992807e3a72',
        type: 'HEALTH_FACILITY',
        address: {
          line: [],
          district: null,
          state: null,
          city: null,
          postalCode: null,
          country: null
        }
      },
      _fhirIDMap: {
        eventLocation: '5c6abc88-26b8-4834-a1a6-2992807e3a72'
      }
    }
    const sectionId = 'template'
    const field = { name: 'placeOfBirth' } as IFormField
    const transformedData = {
      template: {}
    }
    const result = factory(
      transformedData,
      queryData,
      sectionId,
      field,
      undefined,
      mockOfflineDataWithLocationHierarchy
    )
    expect(result).toEqual(expectedResult)
  })
})
