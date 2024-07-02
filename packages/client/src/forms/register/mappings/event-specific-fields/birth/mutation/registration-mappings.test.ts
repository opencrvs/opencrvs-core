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
import { setBirthRegistrationSectionTransformer } from '@client/forms/register/mappings/event-specific-fields/birth/mutation/registration-mappings'
import {
  mockDeclarationData,
  mockBirthRegistrationSectionData
} from '@client/tests/util'
import { TransformedData } from '@client/forms'
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
          relationship: 'OTHER',
          otherRelationship: 'Uncle',
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
})
