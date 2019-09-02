import { setBirthRegistrationSectionTransformer } from '@register/forms/register/fieldMappings/birth/mutation/registration-mappings'
import {
  mockApplicationData,
  mockBirthRegistrationSectionData
} from '@register/tests/util'
import { TransformedData } from '@register/forms'
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
})
