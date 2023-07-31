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
import { setDeathRegistrationSectionTransformer } from '@client/forms/register/fieldMappings/death/mutation/event-mappings'
import {
  mockDeathDeclarationData,
  mockDeathRegistrationSectionData
} from '@client/tests/util'
import { TransformedData } from '@client/forms'
import { cloneDeep } from 'lodash'

describe('Death registration mutation mapping related tests', () => {
  it('Test certificate mapping with minimum data', () => {
    const transformedData: TransformedData = {
      registration: {}
    }
    setDeathRegistrationSectionTransformer(
      transformedData,
      mockDeathDeclarationData,
      'registration'
    )
    expect(transformedData.registration).toBeDefined()
    expect(transformedData.registration.registrationNumber).toEqual(
      '201908122365DDSS0SE1'
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
    const mockDeathDeclaration = cloneDeep(mockDeathDeclarationData)
    mockDeathDeclaration.registration = mockDeathRegistrationSectionData
    setDeathRegistrationSectionTransformer(
      transformedData,
      mockDeathDeclaration,
      'registration'
    )
    expect(transformedData.registration).toBeDefined()
    expect(transformedData.registration.trackingId).toEqual('DDSS0SE')
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
          ]
        },
        hasShowedVerifiedDocument: true
      }
    ])
  })
})
