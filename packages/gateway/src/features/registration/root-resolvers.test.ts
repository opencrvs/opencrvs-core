import { resolvers } from './root-resolvers'
import * as fetch from 'jest-fetch-mock'

describe('Registration root resolvers', () => {
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
  describe('markBirthAsVoided()', () => {
    it('updates a task with rejected status, reason and comment', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            fullUrl:
              'http://localhost:3447/fhir/Task/ba0412c6-5125-4447-bd32-fb5cf336ddbc',
            resource: {
              resourceType: 'Task',
              status: 'requested',
              code: {
                coding: [
                  { system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }
                ]
              },
              extension: [
                {
                  url: 'http://opencrvs.org/specs/extension/contact-person',
                  valueString: 'MOTHER'
                },
                {
                  url: 'http://opencrvs.org/specs/extension/regLastUser',
                  valueString: 'DUMMY'
                }
              ],
              lastModified: '2018-11-28T15:13:57.492Z',
              note: [
                {
                  text: '',
                  time: '2018-11-28T15:13:57.492Z',
                  authorString: 'DUMMY'
                },
                {
                  text: 'reason=bad&comment=because',
                  time: 'Thu, 29 Nov 2018 09:15:55 GMT',
                  authorString: ''
                }
              ],
              focus: {
                reference: 'Composition/df3fb104-4c2c-486f-97b3-edbeabcd4422'
              },
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                  value: 'B1mW7jA'
                }
              ],
              businessStatus: {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/reg-status',
                    code: 'REJECTED'
                  }
                ]
              },
              meta: {
                lastUpdated: '2018-11-28T15:13:59.406+00:00',
                versionId: '54256ee4-2485-454f-86d4-7a25b649bb35'
              },
              id: 'ba0412c6-5125-4447-bd32-fb5cf336ddbc'
            }
          })
        ],

        [
          JSON.stringify({
            taskId: '888'
          }),
          { status: 200 }
        ]
      )
      const id = 'df3fb104-4c2c-486f-97b3-edbeabcd4422'
      const reason = 'Misspelling'
      const comment = 'Family name misspelled'
      // @ts-ignore
      const result = await resolvers.Mutation.markBirthAsVoided(
        {},
        { id, reason, comment }
      )

      expect(result).toBeDefined()
      expect(result).toBe('888')

      console.log(fetch.mock.calls)
    })
  })
})
