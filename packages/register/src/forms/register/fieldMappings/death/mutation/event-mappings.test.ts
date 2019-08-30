import { setDeathRegistrationSectionTransformer } from '@register/forms/register/fieldMappings/death/mutation/event-mappings'
import {
  mockDeathApplicationData,
  mockDeathRegistrationSectionData
} from '@register/tests/util'
import { TransformedData } from '@register/forms'
import { cloneDeep } from 'lodash'

describe('Death registration mutation mapping related tests', () => {
  it('Test certificate mapping with minimum data', () => {
    const transformedData: TransformedData = {
      registration: {}
    }
    setDeathRegistrationSectionTransformer(
      transformedData,
      mockDeathApplicationData,
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
    const mockDeathApplication = cloneDeep(mockDeathApplicationData)
    mockDeathApplication.registration = mockDeathRegistrationSectionData
    setDeathRegistrationSectionTransformer(
      transformedData,
      mockDeathApplication,
      'registration'
    )
    expect(transformedData.registration).toBeDefined()
    expect(transformedData.registration.trackingId).toEqual('DDSS0SE')
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
