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
import { buildFHIRBundle } from '@gateway/features/registration/fhir-builders'
import { EVENT_TYPE } from '@gateway/features/fhir/constants'
import * as fetchMock from 'jest-fetch-mock'
import {
  GQLAddressType,
  GQLAddressUse,
  GQLGender,
  GQLPaymentType,
  GQLTelecomSystem,
  GQLTelecomUse
} from '@gateway/graphql/schema'

const fetch = fetchMock as fetchMock.FetchMock

test('should build a minimal FHIR registration document without error', async () => {
  fetch.mockResponse(
    JSON.stringify({
      refUrl: '/ocrvs/3d3623fa-333d-11ed-a261-0242ac120002.png'
    })
  )
  const fhir = (await buildFHIRBundle(
    {
      deceased: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eeb39',
        identifier: [{ id: '123456', type: 'OTHER', otherType: 'Custom type' }],
        gender: GQLGender.male,
        birthDate: '2000-01-28',
        age: 34,
        maritalStatus: 'MARRIED',
        name: [{ firstNames: 'Jane', familyName: 'Doe', use: 'en' }],
        deceased: {
          deceased: true,
          deathDate: '2014-01-28'
        },
        multipleBirth: 1,
        dateOfMarriage: '2014-01-28',
        nationality: ['BGD'],
        educationalAttainment: 'UPPER_SECONDARY_ISCED_3'
      },
      mother: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7sdasadf',
        name: [{ firstNames: 'Jessica', familyName: 'Alba', use: 'en' }]
      },
      father: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-458dksls',
        name: [{ firstNames: 'Cash', familyName: 'Warren', use: 'en' }]
      },
      spouse: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-38372jdjuw',
        name: [{ firstNames: 'Megan', familyName: 'Fox', use: 'en' }]
      },
      informant: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eeb39',
        identifier: [{ id: '123456', type: 'OTHER', otherType: 'Custom type' }],
        gender: GQLGender.male,
        birthDate: '2000-01-28',
        maritalStatus: 'MARRIED',
        name: [{ firstNames: 'John', familyName: 'Doe', use: 'en' }],
        multipleBirth: 1,
        occupation: 'Nurse',
        dateOfMarriage: '2014-01-28',
        nationality: ['BGD'],
        educationalAttainment: 'UPPER_SECONDARY_ISCED_4',
        telecom: [
          {
            use: GQLTelecomUse.mobile,
            system: GQLTelecomSystem.phone,
            value: '0171111111'
          }
        ],
        address: [
          {
            use: GQLAddressUse.home,
            type: GQLAddressType.both,
            line: ['2760 Mlosi Street', 'Wallacedene'],
            district: 'Kraaifontein',
            state: 'Western Cape',
            city: 'Cape Town',
            postalCode: '7570',
            country: 'BGD'
          },
          {
            use: GQLAddressUse.home,
            type: GQLAddressType.both,
            line: ['40 Orbis Wharf', 'Wallacedene'],
            text: 'Optional address text',
            district: 'Kraaifontein',
            state: 'Western Cape',
            city: 'Cape Town',
            postalCode: '7570',
            country: 'BGD'
          }
        ],
        photo: [
          {
            contentType: 'image/jpeg',
            data: '123456'
          }
        ]
        // _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7xxy33',
      },
      medicalPractitioner: {
        name: 'Full Name of Doctor',
        qualification: 'MBBS',
        lastVisitDate: '2000-01-28'
      },
      registration: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce',
        informantType: 'OTHER',
        otherInformantType: 'Nephew',
        paperFormID: '12345678',
        trackingId: 'B123456',
        draftId: '8f18a6ea-89d1-4b03-80b3-57509a7eebce',
        registrationNumber: '201923324512345671',
        status: [
          {
            comments: [
              {
                comment: 'This is just a test data',
                createdAt: '2018-10-31T09:40:05+10:00'
              }
            ],
            timestamp: '2018-10-31T09:40:05+10:00',
            timeLoggedMS: 1234
          }
        ],
        attachments: [
          {
            _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce11',
            contentType: 'image/jpeg',
            data: 'SampleData',
            originalFileName: 'original.jpg',
            systemFileName: 'system.jpg',
            type: 'NATIONAL_ID',
            createdAt: '2018-10-21'
          },
          {
            _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce22',
            contentType: 'image/png',
            data: 'ExampleData',
            originalFileName: 'original.png',
            systemFileName: 'system.png',
            type: 'PASSPORT',
            createdAt: '2018-10-22',
            subject: 'MOTHER'
          }
        ],
        certificates: [
          {
            collector: {
              relationship: 'OTHER',
              name: [{ firstNames: 'Doe', familyName: 'Jane', use: 'en' }],
              identifier: [{ id: '123456', type: 'PASSPORT' }]
            },
            hasShowedVerifiedDocument: true,
            payments: [
              {
                paymentId: '1234',
                type: GQLPaymentType.MANUAL,
                total: 50.0,
                amount: 50.0,
                date: '2018-10-22'
              }
            ],
            data: 'DUMMY-DATA'
          }
        ]
      },
      eventLocation: {
        type: 'PRIVATE_HOME',
        partOf: 'Location/456',
        address: {
          country: '789',
          state: '101112',
          district: '131415',
          postalCode: 'sw11',
          line: [
            'addressLine1',
            'addressLine1UrbanOption',
            'addressLine2',
            '123',
            '456',
            '789'
          ]
        }
      },
      mannerOfDeath: 'NATURAL_CAUSES',
      causeOfDeathMethod: 'MEDICALLY_CERTIFIED',
      causeOfDeath: 'age',
      maleDependentsOfDeceased: 1,
      femaleDependentsOfDeceased: 1,
      createdAt: '2018-10-31T09:45:05+10:00',
      _fhirIDMap: {
        composition: '8f18a6ea-89d1-4b03-80b3-57509a7eebcedsd',
        encounter: '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dsakelske'
      }
    },
    'DEATH' as EVENT_TYPE,
    {} as any
  )) as any
  expect(fhir).toBeDefined()
  expect(fhir.entry[0].resource.section.length).toBe(8)
  expect(fhir.entry[0].resource.date).toBeDefined()
  expect(fhir.entry[0].resource.id).toBe(
    '8f18a6ea-89d1-4b03-80b3-57509a7eebcedsd'
  )

  // deceased
  expect(fhir.entry[1].resource.gender).toBe('male')
  expect(fhir.entry[1].resource.name[0].given[0]).toEqual('Jane')
  expect(fhir.entry[1].resource.deceasedDateTime).toEqual('2014-01-28')
  // mother
  expect(fhir.entry[2].resource.name[0].given[0]).toEqual('Jessica')
  // father
  expect(fhir.entry[3].resource.name[0].given[0]).toEqual('Cash')
  // spouse
  expect(fhir.entry[4].resource.name[0].given[0]).toEqual('Megan')
  // informant
  expect(fhir.entry[5].resource.resourceType).toEqual('RelatedPerson')
  // informant relationship
  expect(fhir.entry[5].resource.relationship.coding[0].code).toEqual('OTHER')
  expect(fhir.entry[5].resource.relationship.text).toEqual('Nephew')
  expect(fhir.entry[5].resource.patient.reference).toEqual(
    fhir.entry[6].fullUrl
  )
})

test('should build a minimal FHIR registration document without error', async () => {
  fetch.mockResponse(
    JSON.stringify({
      refUrl: '/ocrvs/3d3623fa-333d-11ed-a261-0242ac120002.png'
    })
  )
  const fhir = (await buildFHIRBundle(
    {
      deceased: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eeb39',
        identifier: [{ id: '123456', type: 'OTHER', otherType: 'Custom type' }],
        gender: GQLGender.female,
        birthDate: '2000-01-28',
        maritalStatus: 'MARRIED',
        name: [{ firstNames: 'Jane', familyName: 'Doe', use: 'en' }],
        deceased: {
          deceased: true,
          deathDate: '2014-01-28'
        },
        multipleBirth: 1,
        dateOfMarriage: '2014-01-28',
        nationality: ['BGD'],
        educationalAttainment: 'UPPER_SECONDARY_ISCED_3'
      },
      registration: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce',
        informantType: 'OTHER',
        otherInformantType: 'Nephew'
      },
      informant: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7xxy33',
        identifier: [{ id: '123456', type: 'OTHER', otherType: 'Custom type' }]
      }
    },
    'DEATH' as EVENT_TYPE,
    {} as any
  )) as any
  expect(fhir).toBeDefined()
  // informant relationship
  expect(fhir.entry[3].resource.relationship.coding[0].code).toEqual('OTHER')
  expect(fhir.entry[3].resource.relationship.text).toEqual('Nephew')
  expect(fhir.entry[3].resource.id).toEqual(
    '8f18a6ea-89d1-4b03-80b3-57509a7xxy33'
  )
})
