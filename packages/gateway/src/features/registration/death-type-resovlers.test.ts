import { typeResolvers } from 'src/features/registration/type-resovlers'
import { DECEASED_CODE } from 'src/features/fhir/templates'
import * as fetch from 'jest-fetch-mock'
import {
  mockDeathComposition,
  mockPatient,
  mockObservations,
  mockRelatedPerson
} from 'src/utils/testUtils'

beforeEach(() => {
  fetch.resetMocks()
})

describe('Registration type resolvers', () => {
  it('fetches and returns a deceased patient resource from a composition section', async () => {
    fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Patient' }))

    // @ts-ignore
    const patient = await typeResolvers.DeathRegistration.deceased({
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
    })

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
      const registration = await typeResolvers.DeathRegistration.registration({
        id: 123
      })
      expect(registration).toBeDefined()
      expect(registration.resourceType).toBe('Task')
      expect(mock).toBeCalledWith(
        'http://localhost:5050/fhir/Task?focus=Composition/123',
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
      const registration = await typeResolvers.DeathRegistration.registration({
        id: 123
      })
      expect(registration).toBeNull()
      expect(mock).toBeCalledWith(
        'http://localhost:5050/fhir/Task?focus=Composition/123',
        {
          body: undefined,
          headers: { 'Content-Type': 'application/fhir+json' },
          method: 'GET'
        }
      )
    })

    it('returns deathLocationType', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.deathLocationType))

      // @ts-ignore
      const deaththLocationType = await typeResolvers.DeathRegistration.deathLocationType(
        mockDeathComposition
      )
      expect(deaththLocationType).toEqual('BIRTH_PLACE')
    })
    it('returns deathLocation', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.deathLocation))
      // @ts-ignore
      const deathLocation = await typeResolvers.DeathRegistration.deathLocation(
        mockDeathComposition
      )
      expect(deathLocation).toBeDefined()
      expect(deathLocation).toEqual('123')
    })
    it('returns mannerOfDeath', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.mannerOfDeath))
      // @ts-ignore
      const mannerOfDeath = await typeResolvers.DeathRegistration.mannerOfDeath(
        mockDeathComposition
      )
      expect(mannerOfDeath).toBeDefined()
      expect(mannerOfDeath).toEqual('NATURAL_CAUSES')
    })
    it('returns causeOfDeathMethod', async () => {
      fetch.mockResponseOnce(
        JSON.stringify(mockObservations.causeOfDeathMethod)
      )
      // @ts-ignore
      const causeOfDeathMethod = await typeResolvers.DeathRegistration.causeOfDeathMethod(
        mockDeathComposition
      )
      expect(causeOfDeathMethod).toBeDefined()
      expect(causeOfDeathMethod).toEqual('VERBAL_AUTOPSY')
    })
    it('returns causeOfDeath', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.causeOfDeath))
      // @ts-ignore
      const causeOfDeath = await typeResolvers.DeathRegistration.causeOfDeath(
        mockDeathComposition
      )
      expect(causeOfDeath).toBeDefined()
      expect(causeOfDeath).toEqual('OTHER')
    })
    it('returns informant', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockRelatedPerson))

      // @ts-ignore
      const informant = await typeResolvers.DeathRegistration.informant(
        mockDeathComposition
      )
      expect(informant).toBeDefined()
      expect(informant.resource.resourceType).toEqual('RelatedPerson')
      expect(informant.resource.relationship.coding[0].code).toEqual('OTHER')
      expect(informant.resource.relationship.text).toEqual('Nephew')
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
      const relationship = await typeResolvers.RelatedPerson.relationship({
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
      })
      expect(relationship).toEqual('OTHER')
    })

    it('returns RelatedPerson otherRelationship', async () => {
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
      const relationship = await typeResolvers.RelatedPerson.otherRelationship({
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
      })
      console.log(relationship)
      expect(relationship).toEqual('Nephew')
    })

    it('returns RelatedPerson individual', async () => {
      const mock = fetch.mockResponseOnce(
        JSON.stringify({
          ...mockPatient
        })
      )
      // @ts-ignore
      const person = await typeResolvers.RelatedPerson.individual({
        patient: {
          reference: 'Patient/123' // reference to deceased
        }
      })
      // console.log(response.mockPatient.na)
      expect(person.name[0].family[0]).toEqual('Matinyana')
      expect(mock).toHaveBeenCalledTimes(1)
    })

    it('returns deathDate', () => {
      // @ts-ignore
      const deathDate = typeResolvers.Deceased.deathDate(mockPatient)
      expect(deathDate).toBe('2010-01-01')
    })
  })
})
