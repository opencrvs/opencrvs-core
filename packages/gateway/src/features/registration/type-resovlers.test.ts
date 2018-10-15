import { typeResolvers } from 'src/features/registration/type-resovlers'
import {
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE
} from 'src/features/fhir/templates'
import * as fetch from 'jest-fetch-mock'

describe('Registration type resolvers', () => {
  it('fetches and returns a mother patient resource from a composition section', async () => {
    fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Patient' }))

    // @ts-ignore
    const patient = await typeResolvers.BirthRegistration.mother({
      section: [
        {
          code: {
            coding: {
              system: 'http://opencrvs.org/specs/sections',
              code: MOTHER_CODE
            }
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
            coding: {
              system: 'http://opencrvs.org/specs/sections',
              code: FATHER_CODE
            }
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
            coding: {
              system: 'http://opencrvs.org/specs/sections',
              code: CHILD_CODE
            }
          },
          entry: [{ reference: 'Patient/123' }]
        }
      ]
    })

    expect(patient).toEqual({ resourceType: 'Patient' })
  })

  it('returns first names part with one name', () => {
    // @ts-ignore
    const given = typeResolvers.HumanName.firstNames({
      use: 'test',
      given: ['John']
    })
    expect(given).toBe('John')
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

  it('returns identifier', () => {
    // @ts-ignore
    const identifier = typeResolvers.Person.identifier([
      {
        use: 'test',
        value: '123456',
        system: 'PASSPORT'
      }
    ])
    expect(identifier[0].system).toBe('PASSPORT')
  })
})
