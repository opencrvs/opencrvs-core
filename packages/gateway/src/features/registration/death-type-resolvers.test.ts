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
import { typeResolvers } from '@gateway/features/registration/type-resolvers'
import { DECEASED_CODE } from '@gateway/features/fhir/templates'
import {
  mockDeathComposition,
  mockPatient,
  mockObservations,
  mockRelatedPerson,
  mockLocation
} from '@gateway/utils/testUtils'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('Registration type resolvers', () => {
  it('returns createdAt date', () => {
    // @ts-ignore
    const createdAt = typeResolvers.DeathRegistration.createdAt({
      date: '2018-10-05'
    })
    expect(createdAt).toBe('2018-10-05')
  })
  it('fetches and returns a deceased patient resource from a composition section', async () => {
    fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Patient' }))

    // @ts-ignore
    const patient = await typeResolvers.DeathRegistration.deceased(
      {
        section: [
          {
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: DECEASED_CODE
                }
              ]
            },
            entry: [{ reference: 'Patient/123' }]
          }
        ]
      },
      undefined,
      { headers: undefined }
    )

    expect(patient).toEqual({ resourceType: 'Patient' })
  })

  describe('Death Registration type', () => {
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
      const registration = await typeResolvers.DeathRegistration.registration(
        {
          id: 123
        },
        undefined,
        { headers: undefined }
      )
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
      const registration = await typeResolvers.DeathRegistration.registration(
        {
          id: 123
        },
        undefined,
        { headers: undefined }
      )
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
      const eventLocation = await typeResolvers.DeathRegistration.eventLocation(
        mockDeathComposition,
        undefined,
        { headers: undefined }
      )
      expect(eventLocation).toBeDefined()
      expect(eventLocation).toEqual(mockLocation)
    })
    it('returns mannerOfDeath', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.mannerOfDeath))
      // @ts-ignore
      const mannerOfDeath = await typeResolvers.DeathRegistration.mannerOfDeath(
        mockDeathComposition,
        undefined,
        { headers: undefined }
      )
      expect(mannerOfDeath).toBeDefined()
      expect(mannerOfDeath).toEqual('NATURAL_CAUSES')
    })
    it('returns causeOfDeathMethod', async () => {
      fetch.mockResponseOnce(
        JSON.stringify(mockObservations.causeOfDeathMethod)
      )
      // @ts-ignore
      const causeOfDeathMethod =
        await typeResolvers.DeathRegistration.causeOfDeathMethod(
          mockDeathComposition,
          undefined,
          { headers: undefined }
        )
      expect(causeOfDeathMethod).toBeDefined()
      expect(causeOfDeathMethod).toEqual('VERBAL_AUTOPSY')
    })
    it('returns causeOfDeath', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.causeOfDeath))
      // @ts-ignore
      const causeOfDeath = await typeResolvers.DeathRegistration.causeOfDeath(
        mockDeathComposition,
        undefined,
        { headers: undefined }
      )
      expect(causeOfDeath).toBeDefined()
      expect(causeOfDeath).toEqual('OTHER')
    })
    it('returns informant', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockRelatedPerson))

      // @ts-ignore
      const informant = await typeResolvers.DeathRegistration.informant(
        mockDeathComposition,
        undefined,
        { headers: undefined }
      )
      expect(informant).toBeDefined()
      expect(informant.resource.resourceType).toEqual('RelatedPerson')
      expect(informant.resource.relationship.coding[0].code).toEqual('OTHER')
      expect(informant.resource.relationship.text).toEqual('Nephew')
    })
    it('returns mother', async () => {
      fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Patient' }))

      const mother = await typeResolvers.DeathRegistration.mother(
        mockDeathComposition,
        undefined,
        { headers: undefined }
      )
      expect(mother).toBeDefined()
      expect(mother.resourceType).toEqual('Patient')
    })
    it('returns null as mother if mother section is not available', async () => {
      fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Patient' }))

      const mother = await typeResolvers.DeathRegistration.mother(
        {
          section: []
        },
        undefined,
        { headers: undefined }
      )
      expect(mother).toEqual(null)
    })
    it('returns father', async () => {
      fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Patient' }))

      const father = await typeResolvers.DeathRegistration.father(
        mockDeathComposition,
        undefined,
        { headers: undefined }
      )
      expect(father).toBeDefined()
      expect(father.resourceType).toEqual('Patient')
    })
    it('returns null as father if father section is not available', async () => {
      fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Patient' }))

      const father = await typeResolvers.DeathRegistration.father(
        {
          section: []
        },
        undefined,
        { headers: undefined }
      )
      expect(father).toEqual(null)
    })
    it('returns spouse', async () => {
      fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Patient' }))

      const spouse = await typeResolvers.DeathRegistration.spouse(
        mockDeathComposition,
        undefined,
        { headers: undefined }
      )
      expect(spouse).toBeDefined()
      expect(spouse.resourceType).toEqual('Patient')
    })
    it('returns null as spouse if spouse section is not available', async () => {
      fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Patient' }))

      const spouse = await typeResolvers.DeathRegistration.spouse(
        {
          section: []
        },
        undefined,
        { headers: undefined }
      )
      expect(spouse).toEqual(null)
    })
    it('returns RelatedPerson id', async () => {
      const resourceID = await typeResolvers.RelatedPerson.id(
        {
          id: '1',
          relationship: {
            coding: [
              {
                system:
                  'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
                code: 'OTHER' // or string for unsupported other
              }
            ],
            text: 'Nephew'
          }
        },
        undefined,
        { headers: undefined }
      )
      expect(resourceID).toEqual('1')
    })

    it('returns RelatedPerson relationship', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'OTHER' // or string for unsupported other
            }
          ],
          text: 'Nephew'
        })
      )
      // @ts-ignore
      const relationship = await typeResolvers.RelatedPerson.relationship(
        {
          relationship: {
            coding: [
              {
                system:
                  'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
                code: 'OTHER' // or string for unsupported other
              }
            ],
            text: 'Nephew'
          }
        },
        undefined,
        { headers: undefined }
      )
      expect(relationship).toEqual('OTHER')
    })

    it('returns RelatedPerson otherRelationship', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          coding: [{ text: 'Nephew' }]
        })
      )
      // @ts-ignore
      const relationship = await typeResolvers.RelatedPerson.otherRelationship(
        {
          relationship: {
            text: 'Nephew'
          }
        },
        undefined,
        { headers: undefined }
      )

      expect(relationship).toEqual('Nephew')
    })

    it('returns RelatedPerson name', async () => {
      const mock = jest.fn().mockImplementation(() => {
        return mockPatient
      })

      // @ts-ignore
      const person = await typeResolvers.RelatedPerson.name(
        {
          patient: {
            reference: 'Patient/123' // reference to deceased
          }
        },
        undefined,
        {
          dataSources: {
            patientAPI: {
              getPatient: mock
            }
          }
        }
      )
      expect(person[0].family[0]).toEqual('Matinyana')
      expect(mock).toHaveBeenCalledTimes(1)
    })

    it('returns deathDate', () => {
      // @ts-ignore
      const deathDate = typeResolvers.Deceased.deathDate(mockPatient)
      expect(deathDate).toBe('2010-01-01')
    })

    it('eventLocation is null when section does not exist', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.eventLocation))
      // @ts-ignore
      const eventLocation = await typeResolvers.DeathRegistration.eventLocation(
        {
          section: []
        },
        undefined,
        { headers: undefined }
      )
      expect(eventLocation).toBeNull()
    })
    it('mannerOfDeath is null when section does not exist', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.mannerOfDeath))
      // @ts-ignore
      const mannerOfDeath = await typeResolvers.DeathRegistration.mannerOfDeath(
        {
          section: []
        },
        undefined,
        { headers: undefined }
      )
      expect(mannerOfDeath).toBeNull()
    })
    it('causeOfDeathMethod is null when section does not exist', async () => {
      fetch.mockResponseOnce(
        JSON.stringify(mockObservations.causeOfDeathMethod)
      )
      // @ts-ignore
      const causeOfDeathMethod =
        await typeResolvers.DeathRegistration.causeOfDeathMethod(
          {
            section: []
          },
          undefined,
          { headers: undefined }
        )
      expect(causeOfDeathMethod).toBeNull()
    })
    it('causeOfDeath is null when section does not exist', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.causeOfDeath))
      // @ts-ignore
      const causeOfDeath = await typeResolvers.DeathRegistration.causeOfDeath(
        {
          section: []
        },
        undefined,
        { headers: undefined }
      )
      expect(causeOfDeath).toBeNull()
    })

    it('informant is null when section does not exist', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.informant))
      // @ts-ignore
      const informant = await typeResolvers.DeathRegistration.informant(
        {
          section: []
        },
        undefined,
        { headers: undefined }
      )
      expect(informant).toBeNull()
    })
  })
})
