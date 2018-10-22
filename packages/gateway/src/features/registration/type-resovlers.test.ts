import { typeResolvers } from 'src/features/registration/type-resovlers'
import {
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE
} from 'src/features/fhir/templates'
import * as fetch from 'jest-fetch-mock'
import {
  mockPatient,
  mockDocumentReference,
  mockTask,
  mockComposition
} from 'src/utils/testUtils'

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

  it('returns dateOfMarriage', () => {
    // @ts-ignore
    const dateOfMarriage = typeResolvers.Person.dateOfMarriage(mockPatient)
    expect(dateOfMarriage).toBe('2014-01-28')
  })

  it('returns multipleBirth', () => {
    // @ts-ignore
    const multipleBirth = typeResolvers.Person.multipleBirth(mockPatient)
    expect(multipleBirth).toBe(1)
  })

  it('returns deceased', () => {
    // @ts-ignore
    const deceased = typeResolvers.Person.deceased(mockPatient)
    expect(deceased).toBe('false')
  })

  it('returns nationality', () => {
    // @ts-ignore
    const nationality = typeResolvers.Person.nationality(mockPatient)
    expect(nationality).toBe('BN')
  })

  it('returns educationalAttainment', () => {
    // @ts-ignore
    const educationalAttainment = typeResolvers.Person.educationalAttainment(
      mockPatient
    )
    expect(educationalAttainment).toBe('SECOND_STAGE_TERTIARY_ISCED_6')
  })

  describe('Birth Registration type', () => {
    it('returns a registration object as a task', async () => {
      const mock = fetch.mockResponseOnce(
        JSON.stringify({ resourceType: 'Task' })
      )

      // @ts-ignore
      const registration = await typeResolvers.BirthRegistration.registration({
        id: 123
      })
      expect(registration).toBeDefined()
      expect(registration.resourceType).toBe('Task')
      expect(mock).toBeCalledWith('http://localhost:5001/fhir/Task?focus=123')
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

    it('returns systemFileName', () => {
      // @ts-ignore
      const systemFileName = typeResolvers.Attachment.systemFileName(
        mockDocumentReference
      )
      expect(systemFileName).toBe('1234.pdf')
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
      expect(mock).toBeCalledWith('http://localhost:5001/fhir/Composition/123')
      expect(mock).toBeCalledWith(
        'http://localhost:5001/fhir/DocumentReference/xxx'
      )
      expect(mock).toBeCalledWith(
        'http://localhost:5001/fhir/DocumentReference/yyy'
      )
      expect(mock).toBeCalledWith(
        'http://localhost:5001/fhir/DocumentReference/zzz'
      )
    })
  })
})
