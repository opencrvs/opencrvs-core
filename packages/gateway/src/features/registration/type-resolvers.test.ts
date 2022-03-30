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
import { typeResolvers } from '@gateway/features/registration/type-resolvers'
import {
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE
} from '@gateway/features/fhir/templates'
import {
  mockPatient,
  mockDocumentReference,
  mockUser,
  mockTask,
  mockTaskForDeath,
  mockComposition,
  mockObservations,
  mockLocation,
  mockRelatedPerson,
  mockTaskForError,
  mockCertificateComposition,
  mockCertificate,
  mockErrorComposition,
  mockObservationBundle,
  reasonsNotApplyingMock,
  mockTaskDownloaded
} from '@gateway/utils/testUtils'
import { GQLRegStatus } from '@gateway/graphql/schema'
import { clone } from 'lodash'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('Registration type resolvers', () => {
  it('fetches and returns a mother patient resource from a composition section', async () => {
    fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Patient' }))

    // @ts-ignore
    const patient = await typeResolvers.BirthRegistration.mother({
      section: [
        {
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/sections',
                code: MOTHER_CODE
              }
            ]
          },
          entry: [{ reference: 'Patient/123' }]
        }
      ]
    })

    expect(patient).toEqual({ resourceType: 'Patient' })
  })

  it('fetches and returns a father patient resource from a composition section', async () => {
    fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Patient' }))

    // @ts-ignore
    const patient = await typeResolvers.BirthRegistration.father({
      section: [
        {
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/sections',
                code: FATHER_CODE
              }
            ]
          },
          entry: [{ reference: 'Patient/123' }]
        }
      ]
    })

    expect(patient).toEqual({ resourceType: 'Patient' })
  })

  it('fetches and returns a child patient resource from a composition section', async () => {
    fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Patient' }))

    // @ts-ignore
    const patient = await typeResolvers.BirthRegistration.child({
      section: [
        {
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/sections',
                code: CHILD_CODE
              }
            ]
          },
          entry: [{ reference: 'Patient/123' }]
        }
      ]
    })

    expect(patient).toEqual({ resourceType: 'Patient' })
  })

  it('fetches and returns a null child patient resource from a composition section if not found', async () => {
    fetch.mockResponseOnce(JSON.stringify({}))

    // @ts-ignore
    const patient = await typeResolvers.BirthRegistration.child({
      section: []
    })

    expect(patient).toBeNull()
  })
  it('returns informant', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockRelatedPerson))

    // @ts-ignore
    const informant = await typeResolvers.BirthRegistration.informant(
      mockComposition
    )
    expect(informant).toBeDefined()
    expect(informant.resource.resourceType).toEqual('RelatedPerson')
    expect(informant.resource.relationship.coding[0].code).toEqual('OTHER')
    expect(informant.resource.relationship.text).toEqual('Nephew')
  })

  it('returns primaryCaregiver', async () => {
    const primaryCaregiver =
      await typeResolvers.BirthRegistration.primaryCaregiver(mockComposition)
    expect(primaryCaregiver).toBeDefined()
    expect(primaryCaregiver.patientSection.title).toBe(
      "Primary caregiver's details"
    )
    expect(primaryCaregiver.encounterSection.title).toBe('Birth Encounter')
  })

  it('returns null as primaryCaregiver if no encounter section', async () => {
    const primaryCaregiver =
      await typeResolvers.BirthRegistration.primaryCaregiver({
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: '{{urn_uuid}}'
        },
        resourceType: 'Composition',
        section: []
      })
    expect(primaryCaregiver).toBe(null)
  })

  it('returns id from identifier', () => {
    const id = typeResolvers.IdentityType.id({
      value: '123456789',
      type: 'PASSPORT'
    })
    expect(id).toBe('123456789')
  })

  it('returns type from identifier', () => {
    const type = typeResolvers.IdentityType.type({
      value: '123456789',
      type: 'PASSPORT'
    })
    expect(type).toBe('PASSPORT')
  })

  it('returns otherType from identifier', () => {
    const type = typeResolvers.IdentityType.otherType({
      value: '123456789',
      type: 'OTHER',
      otherType: 'Office ID'
    })
    expect(type).toBe('Office ID')
  })

  it('returns id from identifier', () => {
    const id = typeResolvers.IdentityType.id({
      value: '123456789',
      type: 'PASSPORT'
    })
    expect(id).toBe('123456789')
  })

  it('returns first names part with one name', () => {
    // @ts-ignore
    const given = typeResolvers.HumanName.firstNames({
      use: 'test',
      given: ['John']
    })
    expect(given).toBe('John')
  })

  it('returns first names part with empty first name', () => {
    // @ts-ignore
    const given = typeResolvers.HumanName.firstNames({
      use: 'test',
      given: undefined
    })
    expect(given).toBe('')
  })

  it('returns first names part with multiple naems', () => {
    // @ts-ignore
    const given = typeResolvers.HumanName.firstNames({
      use: 'test',
      given: ['John', 'Dean']
    })
    expect(given).toBe('John Dean')
  })

  it('returns family part of name', () => {
    // @ts-ignore
    const family = typeResolvers.HumanName.familyName({
      use: 'test',
      family: ['Smith']
    })
    expect(family).toBe('Smith')
  })

  it('returns createdAt date', () => {
    // @ts-ignore
    const createdAt = typeResolvers.BirthRegistration.createdAt({
      date: '2018-10-05'
    })
    expect(createdAt).toBe('2018-10-05')
  })

  it('returns dateOfMarriage', () => {
    // @ts-ignore
    const dateOfMarriage = typeResolvers.Person.dateOfMarriage(mockPatient)
    expect(dateOfMarriage).toBe('2014-01-28')
  })

  it('returns marital status', () => {
    // @ts-ignore
    const maritalStatus = typeResolvers.Person.maritalStatus(mockPatient)
    expect(maritalStatus).toBe('Married')
  })

  it('returns occupation', () => {
    // @ts-ignore
    const maritalStatus = typeResolvers.Person.occupation(mockPatient)
    expect(maritalStatus).toBe('Some Occupation')
  })

  it('returns multipleBirth', () => {
    // @ts-ignore
    const multipleBirth = typeResolvers.Person.multipleBirth(mockPatient)
    expect(multipleBirth).toBe(1)
  })

  it('returns deceased', () => {
    // @ts-ignore
    const deceased = typeResolvers.Deceased.deceased(mockPatient)
    expect(deceased).toBe('true')
  })

  it('returns nationality', () => {
    // @ts-ignore
    const nationality = typeResolvers.Person.nationality(mockPatient)
    expect(nationality).toEqual(['BN', 'EN'])
  })

  it('returns null if nationality not found', () => {
    // @ts-ignore
    const nationality = typeResolvers.Person.nationality({
      resourceType: 'Patient',
      extension: []
    })
    expect(nationality).toBeNull()
  })

  it('returns educationalAttainment', () => {
    // @ts-ignore
    const educationalAttainment =
      typeResolvers.Person.educationalAttainment(mockPatient)
    expect(educationalAttainment).toBe('SECOND_STAGE_TERTIARY_ISCED_6')
  })

  describe('History type resolver', () => {
    it('Should return action DOWNLOADED', async () => {
      const action = await typeResolvers.History.action(mockTaskDownloaded)
      expect(action).toEqual(GQLRegStatus.DOWNLOADED)
    })

    it('Should return reject reason', async () => {
      const statusReason = await typeResolvers.History.statusReason(
        mockTaskDownloaded
      )
      expect(statusReason.text).toEqual('Rejected reason')
    })

    it('Should return true if reinstated', () => {
      const reinstated = typeResolvers.History.reinstated(mockTaskDownloaded)
      expect(reinstated).toBe(true)
    })

    it('Should return date', () => {
      const date = typeResolvers.History.date(mockTaskDownloaded)
      expect(date).toBe('2016-10-31T09:45:05+10:00')
    })

    it('Should return user', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockUser))
      const user = await typeResolvers.History.user(
        mockTaskDownloaded,
        null,
        {}
      )
      expect(user.role).toBe(mockUser.role)
    })

    it('Should return location', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockLocation))
      const location = await typeResolvers.History.location(
        mockTaskDownloaded,
        null,
        {}
      )
      expect(location.id).toBe(mockLocation.id)
    })

    it('Should return comment', () => {
      const comment = typeResolvers.History.comments(mockTaskDownloaded)
      expect(comment[0].text).toBe('Comment')
    })

    it('Should return certificate', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockCertificate))

      const certificates = await typeResolvers.History.certificates(
        mockTaskDownloaded,
        null,
        {}
      )
      expect(certificates).toBe(null)
    })
  })

  describe('Birth Registration type', () => {
    it('returns a registration object as a task', async () => {
      const mock = fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              resource: { resourceType: 'Task' }
            }
          ]
        })
      )

      // @ts-ignore
      const registration = await typeResolvers.BirthRegistration.registration({
        id: 123
      })
      expect(registration).toBeDefined()
      expect(registration.resourceType).toBe('Task')
      expect(mock).toBeCalledWith(
        'http://localhost:5001/fhir/Task?focus=Composition/123',
        {
          body: undefined,
          headers: { 'Content-Type': 'application/fhir+json' },
          method: 'GET'
        }
      )
    })

    it('returns a registration null object task not found', async () => {
      const mock = fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: []
        })
      )

      // @ts-ignore
      const registration = await typeResolvers.BirthRegistration.registration({
        id: 123
      })
      expect(registration).toBeNull()
      expect(mock).toBeCalledWith(
        'http://localhost:5001/fhir/Task?focus=Composition/123',
        {
          body: undefined,
          headers: { 'Content-Type': 'application/fhir+json' },
          method: 'GET'
        }
      )
    })

    it('returns a fhirIDMap object', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                resource: {
                  resourceType: 'Observation',
                  context: {
                    reference: 'Encounter/b1912018-ad50-4cdb-9954-5c7a512bc96e'
                  },
                  code: {
                    coding: [
                      {
                        system: 'http://loinc.org',
                        code: '57722-1',
                        display: 'Birth plurality of Pregnancy'
                      }
                    ]
                  },
                  valueQuantity: {
                    value: 'SINGLE'
                  },
                  id: 'aef33762-c5a3-4642-8d03-6e21c0ef6445'
                }
              },
              {
                resource: {
                  resourceType: 'Observation',
                  context: {
                    reference: 'Encounter/b1912018-ad50-4cdb-9954-5c7a512bc96e'
                  },
                  code: {
                    coding: [
                      {
                        system: 'http://loinc.org',
                        code: '3141-9',
                        display: 'Body weight Measured'
                      }
                    ]
                  },
                  valueQuantity: {
                    value: 5,
                    unit: 'kg',
                    system: 'http://unitsofmeasure.org',
                    code: 'kg'
                  },
                  id: '5f761077-9623-4626-8ce6-648724614485'
                }
              },
              {
                resource: {
                  resourceType: 'Observation',
                  context: {
                    reference: 'Encounter/b1912018-ad50-4cdb-9954-5c7a512bc96e'
                  },
                  code: {
                    coding: [
                      {
                        system: 'http://loinc.org',
                        code: '73764-3',
                        display: 'Birth attendant title'
                      }
                    ]
                  },
                  valueString: 'PHYSICIAN',
                  id: '305cf792-dd96-40b7-bdad-909861faa4b4'
                }
              },
              {
                resource: {
                  resourceType: 'Observation',
                  context: {
                    reference: 'Encounter/b1912018-ad50-4cdb-9954-5c7a512bc96e'
                  },
                  code: {
                    coding: [
                      {
                        system: 'http://loinc.org',
                        code: 'present-at-birth-reg',
                        display: 'Present at birth registration'
                      }
                    ]
                  },
                  valueString: 'MOTHER_ONLY',
                  id: '0280e498-5d70-4666-ae4e-12431dcea163'
                }
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Encounter',
            status: 'finished',
            id: 'a1202918-d8fe-4dca-acf1-beb00c5d0cf8',
            location: [
              {
                location: {
                  reference: 'Location/420fa384-4d61-40db-96cf-6b3c7ca54943'
                }
              }
            ],
            meta: {
              lastUpdated: '2019-02-11T08:45:42.960+00:00',
              versionId: 'd9d41892-c5db-41b8-a0e1-6bf540dbf7e8'
            }
          }),
          { status: 200 }
        ]
      )
      const mockCompositionCloned = clone(mockComposition)
      mockCompositionCloned.id = '123'
      mockCompositionCloned.section[4].entry[0].reference = 'Encounter/456'
      // @ts-ignore
      const idMap = await typeResolvers.BirthRegistration._fhirIDMap(
        mockCompositionCloned
      )
      expect(idMap).toEqual({
        composition: '123',
        encounter: '456',
        eventLocation: '420fa384-4d61-40db-96cf-6b3c7ca54943',
        observation: {
          birthType: 'aef33762-c5a3-4642-8d03-6e21c0ef6445',
          weightAtBirth: '5f761077-9623-4626-8ce6-648724614485',
          attendantAtBirth: '305cf792-dd96-40b7-bdad-909861faa4b4',
          presentAtBirthRegistration: '0280e498-5d70-4666-ae4e-12431dcea163'
        }
      })
    })

    it('returns weightAtBirth', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.birthWeight))

      // @ts-ignore
      const weight = await typeResolvers.BirthRegistration.weightAtBirth(
        mockComposition
      )
      expect(weight).toEqual(1.25)
    })

    it('returns birthType', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.birthType))

      // @ts-ignore
      const birthType = await typeResolvers.BirthRegistration.birthType(
        mockComposition
      )
      expect(birthType).toEqual(2)
    })

    it('returns attendantAtBirth', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.birthAttendant))

      // @ts-ignore
      const attendantAtBirth =
        await typeResolvers.BirthRegistration.attendantAtBirth(mockComposition)
      expect(attendantAtBirth).toEqual('PHYSICIAN')
    })
    it('returns birthRegistrationType', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.birthRegistration))

      // @ts-ignore
      const birthRegistrationType =
        await typeResolvers.BirthRegistration.birthRegistrationType(
          mockComposition
        )
      expect(birthRegistrationType).toEqual('BOTH_PARENTS')
    })
    it('returns presentAtBirthRegistration', async () => {
      fetch.mockResponseOnce(
        JSON.stringify(mockObservations.presentAtBirthRegistration)
      )

      // @ts-ignore
      const presentAtBirthRegistration =
        await typeResolvers.BirthRegistration.presentAtBirthRegistration(
          mockComposition
        )
      expect(presentAtBirthRegistration).toEqual('BOTH_PARENTS')
    })
    it('returns lastPreviousLiveBirth', async () => {
      fetch.mockResponseOnce(
        JSON.stringify(mockObservations.lastPreviousLiveBirth)
      )

      // @ts-ignore
      const lastPreviousLiveBirth =
        await typeResolvers.BirthRegistration.lastPreviousLiveBirth(
          mockComposition
        )
      expect(lastPreviousLiveBirth).toEqual('2014-01-28')
    })
    it('returns childrenBornAliveToMother', async () => {
      fetch.mockResponseOnce(
        JSON.stringify(mockObservations.childrenBornAliveToMother)
      )

      // @ts-ignore
      const childrenBornAliveToMother =
        await typeResolvers.BirthRegistration.childrenBornAliveToMother(
          mockComposition
        )
      expect(childrenBornAliveToMother).toEqual(2)
    })
    it('returns foetalDeathsToMother', async () => {
      fetch.mockResponseOnce(
        JSON.stringify(mockObservations.foetalDeathsToMother)
      )

      // @ts-ignore
      const foetalDeathsToMother =
        await typeResolvers.BirthRegistration.foetalDeathsToMother(
          mockComposition
        )
      expect(foetalDeathsToMother).toEqual(null)
    })
    it('returns eventLocation', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            resourceType: 'Encounter',
            status: 'finished',
            id: 'a1202918-d8fe-4dca-acf1-beb00c5d0cf8',
            location: [
              {
                location: {
                  reference: 'Location/420fa384-4d61-40db-96cf-6b3c7ca54943'
                }
              }
            ],
            meta: {
              lastUpdated: '2019-02-11T08:45:42.960+00:00',
              versionId: 'd9d41892-c5db-41b8-a0e1-6bf540dbf7e8'
            }
          }),
          { status: 200 }
        ],
        [JSON.stringify(mockLocation), { status: 200 }]
      )
      // @ts-ignore
      const eventLocation = await typeResolvers.BirthRegistration.eventLocation(
        mockComposition
      )
      expect(eventLocation).toBeDefined()
      expect(eventLocation).toEqual(mockLocation)
    })
  })

  describe('Birth Registration branch', () => {
    it('returns mother null', async () => {
      // @ts-ignore
      const value = await typeResolvers.BirthRegistration.mother({
        section: []
      })
      expect(value).toEqual(null)
    })
    it('returns father null', async () => {
      // @ts-ignore
      const father = await typeResolvers.BirthRegistration.father({
        section: []
      })
      expect(father).toEqual(null)
    })
    it('returns child null', async () => {
      // @ts-ignore
      const child = await typeResolvers.BirthRegistration.father({
        section: []
      })
      expect(child).toEqual(null)
    })
    it('returns informant null', async () => {
      // @ts-ignore
      const informant = await typeResolvers.BirthRegistration.informant({
        section: []
      })
      expect(informant).toEqual(null)
    })
    it('returns weight At birth null', async () => {
      // @ts-ignore
      const weight = await typeResolvers.BirthRegistration.weightAtBirth({
        section: []
      })
      expect(weight).toEqual(null)
    })
    it('returns birthType null', async () => {
      // @ts-ignore
      const birthType = await typeResolvers.BirthRegistration.birthType({
        section: []
      })
      expect(birthType).toEqual(null)
    })
    it('returns attendantAtBirth null', async () => {
      // @ts-ignore
      const attendantAtBirth =
        await typeResolvers.BirthRegistration.attendantAtBirth({
          section: []
        })
      expect(attendantAtBirth).toEqual(null)
    })
    it('returns birthRegistrationType null', async () => {
      // @ts-ignore
      const birthRegistrationType =
        await typeResolvers.BirthRegistration.birthRegistrationType({
          section: []
        })
      expect(birthRegistrationType).toEqual(null)
    })
    it('returns presentAtBirthRegistration null', async () => {
      // @ts-ignore
      const presentAtBirthRegistration =
        await typeResolvers.BirthRegistration.presentAtBirthRegistration({
          section: []
        })
      expect(presentAtBirthRegistration).toEqual(null)
    })
    it('returns presentAtBirthRegistration null', async () => {
      // @ts-ignore
      const presentAtBirthRegistration =
        await typeResolvers.BirthRegistration.presentAtBirthRegistration({
          section: []
        })
      expect(presentAtBirthRegistration).toEqual(null)
    })
    it('returns childrenBornAliveToMother null', async () => {
      // @ts-ignore
      const childrenBornAliveToMother =
        await typeResolvers.BirthRegistration.childrenBornAliveToMother({
          section: []
        })
      expect(childrenBornAliveToMother).toEqual(null)
    })
    it('returns foetalDeathsToMother null', async () => {
      // @ts-ignore
      const foetalDeathsToMother =
        await typeResolvers.BirthRegistration.foetalDeathsToMother({
          section: []
        })
      expect(foetalDeathsToMother).toEqual(null)
    })
    it('returns lastPreviousLiveBirth null', async () => {
      // @ts-ignore
      const lastPreviousLiveBirth =
        await typeResolvers.BirthRegistration.lastPreviousLiveBirth({
          section: []
        })
      expect(lastPreviousLiveBirth).toEqual(null)
    })
  })

  describe('Attachment type', () => {
    it('returns id', () => {
      // @ts-ignore
      const id = typeResolvers.Attachment.id(mockDocumentReference)
      expect(id).toBe('b9648bdf-fb4e-4216-905f-d7fc3930301d')
    })

    it('returns base64 data', () => {
      // @ts-ignore
      const data = typeResolvers.Attachment.data(mockDocumentReference)
      expect(data).toBe('PGJhc2U2NEJpbmFyeT4K')
    })

    it('returns originalFileName', () => {
      // @ts-ignore
      const originalFileName = typeResolvers.Attachment.originalFileName(
        mockDocumentReference
      )
      expect(originalFileName).toBe('scan.pdf')
    })

    it('returns null when originalFileName identifier can not be found', () => {
      // @ts-ignore
      const originalFileName = typeResolvers.Attachment.originalFileName({
        identifer: []
      })
      expect(originalFileName).toBeNull()
    })

    it('returns systemFileName', () => {
      // @ts-ignore
      const systemFileName = typeResolvers.Attachment.systemFileName(
        mockDocumentReference
      )
      expect(systemFileName).toBe('1234.pdf')
    })

    it('returns null when systemFileName identifier can not be found', () => {
      // @ts-ignore
      const systemFileName = typeResolvers.Attachment.systemFileName({
        identifer: []
      })
      expect(systemFileName).toBeNull()
    })

    it('returns type', () => {
      // @ts-ignore
      const type = typeResolvers.Attachment.type(mockDocumentReference)
      expect(type).toBe('PASSPORT')
    })

    it('returns subject', () => {
      // @ts-ignore
      const subject = typeResolvers.Attachment.subject(mockDocumentReference)
      expect(subject).toBe('MOTHER')
    })

    it('returns createdAt date', () => {
      // @ts-ignore
      const createdAt = typeResolvers.Attachment.createdAt(
        mockDocumentReference
      )
      expect(createdAt).toBe('2018-10-18T14:13:03+02:00')
    })
  })

  describe('Registration type', () => {
    it('returns an array of attachments', async () => {
      const mock = fetch
        .mockResponseOnce(JSON.stringify(mockComposition))
        .mockResponseOnce(JSON.stringify({ id: 'xxx' })) // Doc ref xxx
        .mockResponseOnce(JSON.stringify({ id: 'yyy' })) // Doc ref yyy
        .mockResponseOnce(JSON.stringify({ id: 'zzz' })) // Doc ref zzz

      // @ts-ignore
      const attachments = await typeResolvers.Registration.attachments(mockTask)
      expect(attachments).toBeDefined()
      expect(attachments).toHaveLength(3)

      const [a1, a2, a3] = await Promise.all(attachments)
      // @ts-ignore
      expect(a1.id).toBe('xxx')
      // @ts-ignore
      expect(a2.id).toBe('yyy')
      // @ts-ignore
      expect(a3.id).toBe('zzz')

      expect(mock).toHaveBeenCalledTimes(4)

      const expectedOpts = {
        body: undefined,
        headers: { 'Content-Type': 'application/fhir+json' },
        method: 'GET'
      }

      expect(mock).toBeCalledWith(
        'http://localhost:5001/fhir/Composition/123',
        expectedOpts
      )
      expect(mock).toBeCalledWith(
        'http://localhost:5001/fhir/DocumentReference/xxx',
        expectedOpts
      )
      expect(mock).toBeCalledWith(
        'http://localhost:5001/fhir/DocumentReference/yyy',
        expectedOpts
      )
      expect(mock).toBeCalledWith(
        'http://localhost:5001/fhir/DocumentReference/zzz',
        expectedOpts
      )
    })

    it('returns null when the resource has no document section', async () => {
      const mock = fetch.mockResponseOnce(
        JSON.stringify({ resourceType: 'Composition', section: [] })
      )
      const attachments = await typeResolvers.Registration.attachments(mockTask)
      expect(attachments).toBeNull()
      expect(mock).toBeCalledWith(
        'http://localhost:5001/fhir/Composition/123',
        {
          body: undefined,
          headers: { 'Content-Type': 'application/fhir+json' },
          method: 'GET'
        }
      )
    })

    it('returns a correct status from a task object', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [{ resource: mockTask }, { resource: mockTask }]
        })
      )

      // @ts-ignore
      const status = await typeResolvers.Registration.status(mockTask)

      expect(status).toBeDefined()
      expect(status).toHaveLength(2)
      expect(status[0].resourceType).toBe('Task')
      expect(status[1].resourceType).toBe('Task')
    })

    it('returns birth tracking ID from the task object', async () => {
      const trackingID = await typeResolvers.Registration.trackingId(mockTask)

      expect(trackingID).toBe('123')
    })
    it('returns death tracking ID from the task object', async () => {
      const trackingID = await typeResolvers.Registration.trackingId(
        mockTaskForDeath
      )

      expect(trackingID).toBe('123')
    })
    it('returns birth registration number from the task object', async () => {
      const registrationNumber =
        await typeResolvers.Registration.registrationNumber(mockTask)

      expect(registrationNumber).toBe('123')
    })
    it('returns death registration number from the task object', async () => {
      const registrationNumber =
        await typeResolvers.Registration.registrationNumber(mockTaskForDeath)

      expect(registrationNumber).toBe('123')
    })

    it('returns paper form id from the task', async () => {
      // @ts-ignore
      const paperFormId = await typeResolvers.Registration.paperFormID(mockTask)

      expect(paperFormId).toBe('123')
    })

    it('returns form page number from the task', async () => {
      // @ts-ignore
      const formPage = await typeResolvers.Registration.page(mockTask)

      expect(formPage).toBe('123')
    })

    it('returns form book from the task', async () => {
      // @ts-ignore
      const formBook = await typeResolvers.Registration.book(mockTask)

      expect(formBook).toBe('123')
    })

    it('returns registration type from the task', async () => {
      // @ts-ignore
      const regType = await typeResolvers.Registration.type(mockTask)

      expect(regType).toBe('BIRTH')
    })
    it('returns registration type from the task', async () => {
      // @ts-ignore
      const regType = await typeResolvers.Registration.type(mockTaskForDeath)

      expect(regType).toBe('DEATH')
    })
    it('returns contact person from the task', async () => {
      // @ts-ignore
      const contact = await typeResolvers.Registration.contact(mockTask)

      expect(contact).toEqual('MOTHER')
    })

    it('returns contact relationship from the task if other contact person', async () => {
      const extensionOtherContactPerson = [
        {
          url: 'http://opencrvs.org/specs/extension/contact-person',
          valueString: 'OTHER'
        },
        {
          url: 'http://opencrvs.org/specs/extension/contact-relationship',
          valueString: 'Friend'
        },
        {
          url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
          valueString: '01733333333'
        }
      ]

      const mockTaskWithOtherContact = {
        ...mockTask,
        extension: extensionOtherContactPerson
      }
      const contact = await typeResolvers.Registration.contact(
        mockTaskWithOtherContact
      )
      const contactRelationship =
        await typeResolvers.Registration.contactRelationship(
          mockTaskWithOtherContact
        )
      expect(contact).toBe('OTHER')
      expect(contactRelationship).toBe('Friend')
    })

    it('returns contact person phone number from the task', async () => {
      // @ts-ignore
      const contactNumber = await typeResolvers.Registration.contactPhoneNumber(
        mockTask
      )

      expect(contactNumber).toEqual('01733333333')
    })

    it('returns business status of the task', async () => {
      // @ts-ignore
      const status = await typeResolvers.RegWorkflow.type(mockTask)

      expect(status).toBe('DECLARED | VERIFIED | REGISTERED | CERTIFIED')
    })

    it('returns office of the task', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockLocation))

      const office = await typeResolvers.RegWorkflow.office(mockTask)
      expect(office).toBeDefined()
      expect(office.id).toBe('43ac3486-7df1-4bd9-9b5e-728054ccd6ba')
    })

    it('returns null as office of the task', async () => {
      const office = await typeResolvers.RegWorkflow.office(mockTaskForError)
      expect(office).toBeNull()
    })

    it('returns comments of the task', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockUser))

      // @ts-ignore
      const comments = await typeResolvers.RegWorkflow.comments(mockTask)
      // @ts-ignore
      const comment = await typeResolvers.Comment.comment(mockTask.note[0])
      // @ts-ignore
      const user = await typeResolvers.Comment.user(mockTask.note[0])
      // @ts-ignore
      const time = await typeResolvers.Comment.createdAt(mockTask.note[0])

      expect(comments).toBeDefined()

      expect(comments).toHaveLength(1)
      expect(comment).toBe('Comment')
      expect(user.role).toBe(mockUser.role)
      expect(time).toBe('2016-10-31T09:45:05+10:00')
    })

    it('returns timestamp of the task', async () => {
      // @ts-ignore
      const time = await typeResolvers.RegWorkflow.timestamp(mockTask)

      expect(time).toBe('2016-10-31T09:45:05+10:00')
    })

    it('returns timeLogged of the task', async () => {
      fetch.mockResponseOnce(JSON.stringify({ timeSpentEditing: 0 }))
      const timeLogged = await typeResolvers.RegWorkflow.timeLogged(mockTask)

      expect(timeLogged).toBe(0)
    })

    it('returns user of the task', async () => {
      const mock = fetch.mockResponseOnce(JSON.stringify({ _id: '1' }))
      // @ts-ignore
      const user = await typeResolvers.RegWorkflow.user(mockTask)

      expect(mock).toBeCalledWith('http://localhost:3030/getUser', {
        body: JSON.stringify({ practitionerId: '123' }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      })
      expect(user._id).toBe('1')
    })

    it('returns null when there is no user extension in task', async () => {
      fetch.mockResponseOnce(JSON.stringify({}))
      // @ts-ignore
      const user = await typeResolvers.RegWorkflow.user({
        resourceType: 'Task',
        extension: []
      })

      expect(user).toBeNull()
    })

    it('returns location of the task', async () => {
      const mock = fetch.mockResponseOnce(JSON.stringify(mockLocation))

      const taskLocation = await typeResolvers.RegWorkflow.location(mockTask)
      expect(mock).toBeCalledWith('http://localhost:5001/fhir/Location/123', {
        body: undefined,
        headers: { 'Content-Type': 'application/fhir+json' },
        method: 'GET'
      })

      expect(taskLocation.resource.resourceType).toBe('Location')
    })

    it('returns null when there is no location ref in task extension', async () => {
      const taskLocation = await typeResolvers.RegWorkflow.location({
        resourceType: 'Task',
        extension: []
      })

      expect(taskLocation).toBeNull()
    })

    it('throw when tasks has no focus', async () => {
      // @ts-ignore
      expect(typeResolvers.Registration.attachments({})).rejects.toThrowError(
        'Task resource does not have a focus property necessary to lookup the composition'
      )
    })

    it('returns an array of duplicates', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockComposition))

      // @ts-ignore
      const duplicates = await typeResolvers.Registration.duplicates(mockTask)
      expect(duplicates).toBeDefined()
      expect(duplicates).toHaveLength(2)
      expect(duplicates[0]).toBe('xyz')
      expect(duplicates[1]).toBe('abc')
    })

    it('throws when task has no focus in duplicate resolver', async () => {
      // @ts-ignore
      expect(typeResolvers.Registration.duplicates({})).rejects.toThrowError(
        'Task resource does not have a focus property necessary to lookup the composition'
      )
    })
  })

  describe('Location type', () => {
    const location = {
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'DIVISION'
        }
      ],
      name: 'village',
      position: {
        longitude: 18.4392,
        latitude: -34.08002
      }
    }
    it('returns name', () => {
      // @ts-ignore
      const name = typeResolvers.Location.name(location)
      expect(name).toBe('village')
    })
    it('returns identenfier having length 1', () => {
      const identifier = typeResolvers.Location.identifier(location)
      const identifierSystem = typeResolvers.Identifier.system(identifier[0])
      const identifierValue = typeResolvers.Identifier.value(identifier[0])
      expect(identifier).toHaveLength(1)
      expect(identifierSystem).toBe(
        'http://opencrvs.org/specs/id/jurisdiction-type'
      )
      expect(identifierValue).toBe('DIVISION')
    })
    it('returns status', () => {
      // @ts-ignore
      const status = typeResolvers.Location.status(location)
      expect(status).toBe('active')
    })
    it('returns longitude', () => {
      // @ts-ignore
      const longitude = typeResolvers.Location.longitude(location)
      expect(longitude).toBe(18.4392)
    })
    it('returns name', () => {
      // @ts-ignore
      const latitude = typeResolvers.Location.latitude(location)
      expect(latitude).toBe(-34.08002)
    })
  })

  it('return BirthRegistration type', () => {
    const mock = {
      type: {
        coding: [
          {
            code: 'birth-declaration'
          }
        ]
      }
    }
    const res = typeResolvers.EventRegistration.__resolveType(mock)
    expect(res).toEqual('BirthRegistration')
  })
  it('return DeathRegistration type', () => {
    const mock = {
      type: {
        coding: [
          {
            code: 'death-declaration'
          }
        ]
      }
    }
    const res = typeResolvers.EventRegistration.__resolveType(mock)
    expect(res).toEqual('DeathRegistration')
  })

  it('returns certificate of the task', async () => {
    fetch.mockResponses(
      [JSON.stringify(mockCertificateComposition)],
      [JSON.stringify(mockCertificate)]
    )

    const certificates = await typeResolvers.Registration.certificates(mockTask)

    expect(certificates).toBeDefined()
  })

  it('throws error as certificate of the task', async () => {
    expect(typeResolvers.Registration.certificates({})).rejects.toThrowError(
      'Task resource does not have a focus property necessary to lookup the composition'
    )
  })

  it('returns null as certificate of the task', async () => {
    fetch.mockResponses(
      [JSON.stringify(mockErrorComposition)],
      [JSON.stringify(mockCertificate)]
    )

    const certificates = await typeResolvers.Registration.certificates(mockTask)
    expect(certificates).toBeNull()
  })

  describe('Certificate type', () => {
    it('returns collector of the certificate', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockRelatedPerson))

      const relatedPerson = await typeResolvers.Certificate.collector(
        mockCertificate
      )
      expect(relatedPerson).toBeDefined()
      expect(relatedPerson.id).toBe('9185c9f1-a491-41f0-b823-6cba987b550b')
    })
  })

  describe('Primary Caregiver type', () => {
    const primaryCaregiverObj = {
      patientSection: {
        title: "Primary caregiver's details",
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-sections',
              code: 'primary-caregiver-details'
            }
          ],
          text: "Primary caregiver's details"
        },
        entry: [
          {
            reference: 'Patient/123' // reference to a Patient resource contained below, by fullUrl
          }
        ]
      },
      encounterSection: {
        title: 'Birth Encounter',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/sections',
              code: 'birth-encounter'
            }
          ],
          text: 'Birth encounter'
        },
        text: '',
        entry: [
          {
            reference: 'Encounter/123' // reference to Encounter resource contained below
          }
        ]
      }
    }

    it('returns parentDetailsType', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.parentDetailsType))

      const parentDetailsType =
        await typeResolvers.PrimaryCaregiver.parentDetailsType(
          primaryCaregiverObj
        )

      expect(parentDetailsType).toBe('MOTHER_AND_FATHER')
    })

    it('returns null as parentDetailsType if there is no parent details type section', async () => {
      fetch.mockResponseOnce(JSON.stringify({}))

      const parentDetailsType =
        await typeResolvers.PrimaryCaregiver.parentDetailsType(
          primaryCaregiverObj
        )

      expect(parentDetailsType).toBe(null)
    })

    it('returns primaryCaregiver', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockPatient))

      const primaryCaregiver =
        await typeResolvers.PrimaryCaregiver.primaryCaregiver(
          primaryCaregiverObj
        )

      expect(primaryCaregiver.name.length).toBeGreaterThan(0)
    })

    it('returns null if no patientSection', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockPatient))

      const primaryCaregiver =
        await typeResolvers.PrimaryCaregiver.primaryCaregiver({})

      expect(primaryCaregiver).toBe(null)
    })

    it('returns reasonsNotApplying', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservationBundle))

      const reasonsNotApplying =
        await typeResolvers.PrimaryCaregiver.reasonsNotApplying(
          primaryCaregiverObj
        )

      expect(reasonsNotApplying).toEqual(reasonsNotApplyingMock)
    })

    it('returns reasonsNotApplying', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              fullUrl: 'urn:uuid:<uuid>',
              resource: {
                resourceType: 'Observation',
                context: {
                  reference: 'Encounter/123'
                },
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/specs/obs-type',
                      code: 'primary-caregiver'
                    }
                  ]
                },
                valueString: 'INFORMANT'
              }
            }
          ]
        })
      )

      const reasonsNotApplying =
        await typeResolvers.PrimaryCaregiver.reasonsNotApplying(
          primaryCaregiverObj
        )

      expect(reasonsNotApplying).toEqual([
        { primaryCaregiverType: 'INFORMANT' }
      ])
    })

    it('returns empty reasons array if  no observations', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          type: 'searchset'
        })
      )

      const reasonsNotApplying =
        await typeResolvers.PrimaryCaregiver.reasonsNotApplying(
          primaryCaregiverObj
        )

      expect(reasonsNotApplying).toEqual([])
    })
  })

  describe('Reason not applying type', () => {
    it('returns primaryCaregiverType', () => {
      const primaryCaregiverType =
        typeResolvers.ReasonsNotApplying.primaryCaregiverType(
          reasonsNotApplyingMock[2]
        )

      expect(primaryCaregiverType).toBe('OTHER')
    })

    it('returns reasonNotApplying', () => {
      const reason = typeResolvers.ReasonsNotApplying.reasonNotApplying(
        reasonsNotApplyingMock[0]
      )

      expect(reason).toBe('Sick')
    })

    it('returns isDeceased', () => {
      const isDeceased = typeResolvers.ReasonsNotApplying.isDeceased(
        reasonsNotApplyingMock[1]
      )

      expect(isDeceased).toBe(true)
    })
  })
})
