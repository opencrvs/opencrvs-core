import { buildFHIRBundle } from '@gateway/features/registration/fhir-builders'
import { EVENT_TYPE } from '@gateway/features/fhir/constants'

test('should build a minimal FHIR registration document without error', async () => {
  const fhir = await buildFHIRBundle(
    {
      deceased: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eeb39',
        identifier: [{ id: '123456', type: 'OTHER', otherType: 'Custom type' }],
        gender: 'female',
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
      informant: {
        individual: {
          _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eeb39',
          identifier: [
            { id: '123456', type: 'OTHER', otherType: 'Custom type' }
          ],
          gender: 'male',
          birthDate: '2000-01-28',
          maritalStatus: 'MARRIED',
          name: [{ firstNames: 'John', familyName: 'Doe', use: 'en' }],
          multipleBirth: 1,
          dateOfMarriage: '2014-01-28',
          nationality: ['BGD'],
          educationalAttainment: 'UPPER_SECONDARY_ISCED_4',
          telecom: [{ use: 'mobile', system: 'phone', value: '0171111111' }],
          address: [
            {
              use: 'home',
              type: 'both',
              line: ['2760 Mlosi Street', 'Wallacedene'],
              district: 'Kraaifontein',
              state: 'Western Cape',
              city: 'Cape Town',
              postalCode: '7570',
              country: 'BGD'
            },
            {
              use: 'home',
              type: 'both',
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
              data: '123456',
              title: 'father-national-id'
            }
          ]
        },
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7xxy33',
        relationship: 'OTHER',
        otherRelationship: 'Nephew'
      },
      registration: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce',
        contact: 'MOTHER',
        paperFormID: '12345678',
        trackingId: 'B123456',
        registrationNumber: '201923324512345671',
        status: [
          {
            comments: [
              {
                comment: 'This is just a test data',
                createdAt: '2018-10-31T09:45:05+10:00'
              }
            ],
            timestamp: '2018-10-31T09:45:05+10:00'
          }
        ],
        attachments: [
          {
            _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce11',
            contentType: 'image/jpeg',
            data: 'SampleData',
            status: 'final',
            originalFileName: 'original.jpg',
            systemFileName: 'system.jpg',
            type: 'NATIONAL_ID_FRONT',
            createdAt: '2018-10-21'
          },
          {
            _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce22',
            contentType: 'image/png',
            data: 'ExampleData',
            status: 'deleted',
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
              individual: {
                name: [{ firstNames: 'Doe', familyName: 'Jane', use: 'en' }],
                identifier: [{ id: '123456', type: 'PASSPORT' }]
              }
            },
            hasShowedVerifiedDocument: true,
            payments: [
              {
                paymentId: '1234',
                type: 'MANUAL',
                total: 50.0,
                amount: 50.0,
                outcome: 'COMPLETED',
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
            'addressLine1CityOption',
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
      createdAt: new Date(),
      _fhirIDMap: {
        composition: '8f18a6ea-89d1-4b03-80b3-57509a7eebcedsd',
        encounter: '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dsakelske'
      }
    },
    'DEATH' as EVENT_TYPE
  )
  expect(fhir).toBeDefined()
  expect(fhir.entry[0].resource.section.length).toBe(5)
  expect(fhir.entry[0].resource.date).toBeDefined()
  expect(fhir.entry[0].resource.id).toBe(
    '8f18a6ea-89d1-4b03-80b3-57509a7eebcedsd'
  )

  // deceased
  expect(fhir.entry[1].resource.gender).toBe('female')
  expect(fhir.entry[1].resource.name[0].given[0]).toEqual('Jane')
  expect(fhir.entry[1].resource.deceasedDateTime).toEqual('2014-01-28')

  // informant
  expect(fhir.entry[2].resource.resourceType).toEqual('RelatedPerson')
  // informant relationship
  expect(fhir.entry[2].resource.relationship.coding[0].code).toEqual('OTHER')
  expect(fhir.entry[2].resource.relationship.text).toEqual('Nephew')
  expect(fhir.entry[2].resource.patient.reference).toEqual(
    fhir.entry[3].fullUrl
  )
})

test('should build a minimal FHIR registration document without error', async () => {
  const fhir = await buildFHIRBundle(
    {
      deceased: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eeb39',
        identifier: [{ id: '123456', type: 'OTHER', otherType: 'Custom type' }],
        gender: 'female',
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
      informant: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7xxy33',
        individual: {
          _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eeb39',
          identifier: [
            { id: '123456', type: 'OTHER', otherType: 'Custom type' }
          ]
        },
        otherRelationship: 'Nephew'
      }
    },
    'DEATH' as EVENT_TYPE
  )
  expect(fhir).toBeDefined()
  // informant relationship
  expect(fhir.entry[2].resource.relationship.coding[0].code).toEqual('OTHER')
  expect(fhir.entry[2].resource.relationship.text).toEqual('Nephew')
  expect(fhir.entry[2].resource.id).toEqual(
    '8f18a6ea-89d1-4b03-80b3-57509a7xxy33'
  )
})
