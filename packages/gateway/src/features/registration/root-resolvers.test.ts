import { resolvers } from './root-resolvers'
import * as fetch from 'jest-fetch-mock'

describe('Registration root resolvers', () => {
  describe('fetchBirthRegistration()', () => {
    it('returns object of composition result', async () => {
      fetch.mockResponseOnce(JSON.stringify({}))
      // @ts-ignore
      const compositions = await resolvers.Query.fetchBirthRegistration(
        {},
        { id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce' }
      )
      expect(compositions).toBeDefined()
      expect(compositions).toBeInstanceOf(Object)
    })
  })
  describe('listBirthRegistrations()', () => {
    it('returns an array of composition results', async () => {
      fetch.mockResponseOnce(JSON.stringify({ entry: [{}, {}] }))
      // @ts-ignore
      const compositions = await resolvers.Query.listBirthRegistrations(
        {},
        { status: 'preliminary' }
      )

      expect(compositions).toBeDefined()
      expect(compositions).toBeInstanceOf(Array)
      expect(compositions).toHaveLength(2)
    })
  })
  const details = {
    child: {
      name: [{ use: 'en', firstNames: 'অনিক', familyName: 'হক' }]
    },
    mother: {
      name: [{ use: 'en', firstNames: 'তাহসিনা', familyName: 'হক' }],
      telecom: [{ system: 'phone', value: '+8801622688231' }]
    },
    registration: { contact: 'MOTHER' }
  }
  describe('createBirthRegistration()', () => {
    it('posts a fhir bundle', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          trackingid: 'B123456'
        })
      )
      // @ts-ignore
      const result = await resolvers.Mutation.createBirthRegistration(
        {},
        { details }
      )

      expect(result).toBeDefined()
      expect(result.length).toBe(7)
      expect(result).toMatch(/^B/)
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('throws an error when the request returns an error code', async () => {
      fetch.mockResponseOnce('Boom!', { status: 401 })
      await expect(
        // @ts-ignore
        resolvers.Mutation.createBirthRegistration({}, { details })
      ).rejects.toThrowError(
        'Workflow post to /createBirthRegistration failed with [401] body: Boom!'
      )
    })

    it("throws an error when the response isn't what we expect", async () => {
      fetch.mockResponseOnce(JSON.stringify({ unexpected: true }))
      await expect(
        // @ts-ignore
        resolvers.Mutation.createBirthRegistration({}, { details })
      ).rejects.toThrowError('Workflow response did not send a valid response')
    })
  })
})
