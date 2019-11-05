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
import {
  setBirthRegistrationSectionTransformer,
  changeHirerchyMutationTransformer
} from '@register/forms/register/fieldMappings/birth/mutation/registration-mappings'
import {
  mockApplicationData,
  mockBirthRegistrationSectionData
} from '@register/tests/util'
import { TransformedData, IFormField } from '@register/forms'
import { cloneDeep } from 'lodash'

describe('Birth registration mutation mapping related tests', () => {
  it('Test certificate mapping with minimum data', () => {
    const transformedData: TransformedData = {
      registration: {}
    }
    setBirthRegistrationSectionTransformer(
      transformedData,
      mockApplicationData,
      'registration'
    )
    expect(transformedData.registration).toBeDefined()
    expect(transformedData.registration.registrationNumber).toEqual(
      '201908122365BDSS0SE1'
    )
    expect(transformedData.registration.certificates).toEqual([
      {
        collector: {
          relationship: 'MOTHER'
        },
        hasShowedVerifiedDocument: true
      }
    ])
  })
  it('Test certificate mapping with other collector data', () => {
    const transformedData: TransformedData = {
      registration: {}
    }
    const mockBirthApplication = cloneDeep(mockApplicationData)
    mockBirthApplication.registration = mockBirthRegistrationSectionData
    setBirthRegistrationSectionTransformer(
      transformedData,
      mockBirthApplication,
      'registration'
    )
    expect(transformedData.registration).toBeDefined()
    expect(transformedData.registration.trackingId).toEqual('BDSS0SE')
    expect(transformedData.registration.certificates).toEqual([
      {
        collector: {
          relationship: 'OTHER',
          otherRelationship: 'Uncle',
          individual: {
            name: [
              {
                use: 'en',
                firstNames: 'Mushraful',
                familyName: 'Hoque'
              }
            ],
            identifier: [
              {
                id: '123456789',
                type: 'PASSPORT'
              }
            ]
          }
        },
        hasShowedVerifiedDocument: true
      }
    ])
  })

  it('changeHierarchyMutation transformer test', () => {
    const transformedData: TransformedData = {
      registrationPhone: ''
    }

    const mockBirthApplication = cloneDeep(mockApplicationData)
    mockBirthApplication.registration = mockBirthRegistrationSectionData
    const field = { name: 'whoseContactDetails' } as IFormField
    changeHirerchyMutationTransformer()(
      transformedData,
      mockBirthApplication,
      'registration',
      field,
      { name: 'registrationPhone' } as IFormField
    )
    expect(transformedData).toEqual({
      registrationPhone: '01557394986'
    })
  })
})
