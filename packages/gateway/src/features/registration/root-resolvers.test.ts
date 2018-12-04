import { resolvers } from './root-resolvers'
import * as fetch from 'jest-fetch-mock'

beforeEach(() => {
  fetch.resetMocks()
})

describe('Registration root resolvers', () => {
  describe('fetchBirthRegistration()', () => {
    it('returns object of composition result', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce'
        })
      )
      // @ts-ignore
      const composition = await resolvers.Query.fetchBirthRegistration(
        {},
        { id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce' }
      )
      expect(composition).toBeDefined()
      expect(composition.id).toBe('0411ff3d-78a4-4348-8eb7-b023a0ee6dce')
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
  describe('markBirthAsVoided()', () => {
    it('updates a task with rejected status, reason and comment', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            resourceType: 'Bundle',
            id: 'dc4e9b8b-82fa-4868-a6d2-2fb49f795ec1',
            meta: { lastUpdated: '2018-11-29T10:43:30.286+00:00' },
            type: 'searchset',
            total: 1,
            link: [
              {
                relation: 'self',
                url:
                  'http://localhost:3447/fhir/Task?focus=Composition/df3fb104-4c2c-486f-97b3-edbeabcd4422'
              }
            ],
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/Task/ba0412c6-5125-4447-bd32-fb5cf336ddbc',
                resource: {
                  resourceType: 'Task',
                  status: 'requested',
                  code: {
                    coding: [
                      {
                        system: 'http://opencrvs.org/specs/types',
                        code: 'BIRTH'
                      }
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
                    }
                  ],
                  focus: {
                    reference:
                      'Composition/df3fb104-4c2c-486f-97b3-edbeabcd4422'
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
                    lastUpdated: '2018-11-29T10:40:08.913+00:00',
                    versionId: 'aa8c1c4a-4680-497f-81f7-fde357fdb77d'
                  },
                  id: 'ba0412c6-5125-4447-bd32-fb5cf336ddbc'
                }
              }
            ]
          })
        ],

        [
          JSON.stringify({ taskId: 'ba0412c6-5125-4447-bd32-fb5cf336ddbc' }),
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
      const postData = JSON.parse(fetch.mock.calls[1][1].body)
      expect(postData.entry[0].resource.note[1].text).toBe(
        'reason=Misspelling&comment=Family name misspelled'
      )
      expect(result).toBe('ba0412c6-5125-4447-bd32-fb5cf336ddbc')
    })
    describe('markBirthAsVoided()', () => {
      it('throws an error if fhir responds without a task', async () => {
        fetch.mockResponses(
          [
            JSON.stringify({
              resourceType: 'Bundle',
              id: 'dc4e9b8b-82fa-4868-a6d2-2fb49f795ec1',
              meta: { lastUpdated: '2018-11-29T10:43:30.286+00:00' },
              type: 'searchset',
              total: 1,
              link: [
                {
                  relation: 'self',
                  url:
                    'http://localhost:3447/fhir/Task?focus=Composition/df3fb104-4c2c-486f-97b3-edbeabcd4422'
                }
              ],
              entry: [
                {
                  fullUrl:
                    'http://localhost:3447/fhir/Task/ba0412c6-5125-4447-bd32-fb5cf336ddbc',
                  resource: {
                    resourceType: 'Task',
                    status: 'requested',
                    code: {
                      coding: [
                        {
                          system: 'http://opencrvs.org/specs/types',
                          code: 'BIRTH'
                        }
                      ]
                    },
                    extension: [
                      {
                        url:
                          'http://opencrvs.org/specs/extension/contact-person',
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
                        text:
                          'reason=Misspelling&comment=CHild name was misspelled',
                        time: 'Thu, 29 Nov 2018 10:37:17 GMT',
                        authorString: 'DUMMY'
                      }
                    ],
                    focus: {
                      reference:
                        'Composition/df3fb104-4c2c-486f-97b3-edbeabcd4422'
                    },
                    identifier: [
                      {
                        system:
                          'http://opencrvs.org/specs/id/birth-tracking-id',
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
                      lastUpdated: '2018-11-29T10:40:08.913+00:00',
                      versionId: 'aa8c1c4a-4680-497f-81f7-fde357fdb77d'
                    },
                    id: 'ba0412c6-5125-4447-bd32-fb5cf336ddbc'
                  }
                }
              ]
            })
          ],

          [JSON.stringify({ unexpected: true })]
        )
        const id = 'df3fb104-4c2c-486f-97b3-edbeabcd4422'
        const reason = 'Misspelling'
        const comment = 'Family name misspelled'

        await expect(
          // @ts-ignore
          resolvers.Mutation.markBirthAsVoided({}, { id, reason, comment })
        ).rejects.toThrowError(
          'Workflow response did not send a valid response'
        )
      })
    })
  })
})
