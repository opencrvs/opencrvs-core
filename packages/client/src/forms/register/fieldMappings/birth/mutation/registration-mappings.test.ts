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
} from '@client/forms/register/fieldMappings/birth/mutation/registration-mappings'
import {
  mockDeclarationData,
  mockBirthRegistrationSectionData
} from '@client/tests/util'
import { TransformedData, IFormField } from '@client/forms'
import { cloneDeep } from 'lodash'

describe('Birth registration mutation mapping related tests', () => {
  it('Test certificate mapping with other collector data', () => {
    const transformedData: TransformedData = {
      registration: {}
    }
    const mockBirthDeclaration = cloneDeep(mockDeclarationData)
    mockBirthDeclaration.registration = mockBirthRegistrationSectionData
    setBirthRegistrationSectionTransformer(
      transformedData,
      mockBirthDeclaration,
      'registration'
    )
    expect(transformedData.registration).toBeDefined()
    expect(transformedData.registration.trackingId).toEqual('BDSS0SE')
    expect(transformedData.registration.certificates).toEqual([
      {
        collector: {
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
          ],
          affidavit: [
            {
              id: '123456789',
              contentType: 'abc',
              data: 'BASE64 data'
            }
          ]
        },
        hasShowedVerifiedDocument: true
      }
    ])
  })
  it('Test certificate mapping without any data', () => {
    const transformedData: TransformedData = {
      registration: {}
    }
    setBirthRegistrationSectionTransformer(
      transformedData,
      mockDeclarationData,
      'registration'
    )
    expect(transformedData.registration).toBeDefined()
    expect(transformedData.registration.registrationNumber).toEqual(
      '201908122365BDSS0SE1'
    )
    expect(transformedData.registration.certificates).toEqual([{}])
  })

  it('changeHierarchyMutation transformer test', () => {
    const transformedData: TransformedData = {
      registrationPhone: ''
    }

    const mockBirthDeclaration = cloneDeep(mockDeclarationData)
    mockBirthDeclaration.registration = mockBirthRegistrationSectionData
    const field = { name: 'whoseContactDetails' } as IFormField
    changeHirerchyMutationTransformer()(
      transformedData,
      mockBirthDeclaration,
      'registration',
      field,
      { name: 'registrationPhone' } as IFormField
    )
    expect(transformedData).toEqual({
      registrationPhone: '01557394986'
    })
  })
})
