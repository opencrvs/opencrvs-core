import { resolvers } from './root-resolvers'
import * as fetch from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

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
  describe('listEventRegistrations()', () => {
    it('returns an array of composition results', async () => {
      fetch.mockResponseOnce(JSON.stringify({ entry: [{}, {}], total: 2 }))
      // @ts-ignore
      const result = await resolvers.Query.listEventRegistrations({}, {})

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(2)
    })

    it('returns an array of composition results when event and status provided', async () => {
      fetch.mockResponse(
        JSON.stringify({
          entry: [{ resource: { focus: {} } }, { resource: { focus: {} } }],
          total: 2
        })
      )

      // @ts-ignore
      const result = await resolvers.Query.listEventRegistrations(
        {},
        { status: 'DECLARED', event: 'BIRTH' }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(2)
    })
    it('returns an array of composition results when only status provided', async () => {
      fetch.mockResponse(
        JSON.stringify({
          entry: [{ resource: { focus: {} } }, { resource: { focus: {} } }],
          total: 2
        })
      )

      // @ts-ignore
      const result = await resolvers.Query.listEventRegistrations(
        {},
        { status: 'DECLARED' }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(2)
    })
    it('returns an array of composition results when only event provided', async () => {
      fetch.mockResponse(
        JSON.stringify({
          entry: [{ resource: { focus: {} } }, { resource: { focus: {} } }],
          total: 2
        })
      )

      // @ts-ignore
      const result = await resolvers.Query.listEventRegistrations(
        {},
        { event: 'BIRTH' }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(2)
    })
  })
  describe('createDeathRegistration()', () => {
    const details = {
      deceased: {
        name: [{ use: 'bn', firstNames: 'অনিক', familyName: 'হক' }]
      }
    }
    it('posts a fhir bundle', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: {
                  status: '201',
                  location:
                    '/fhir/Composition/9633042c-ca34-4b9f-959b-9d16909fd85c/_history/ad390bed-c88f-4a3b-b861-31798c88b405'
                }
              }
            ],
            type: 'transaction-response'
          })
        ],
        [
          JSON.stringify({
            id: '1648b1fb-bad4-4b98-b8a3-bd7ceee496b6',
            resourceType: 'Composition',
            identifier: {
              system: 'urn:ietf:rfc:3986',
              value: 'DewpkiM'
            }
          })
        ]
      )
      // @ts-ignore
      const result = await resolvers.Mutation.createDeathRegistration(
        {},
        { details }
      )

      expect(result).toBeDefined()
      expect(result.length).toBe(7)
      expect(result).toMatch(/^D/)
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })
    it('posts a fhir bundle as registrar', async () => {
      const token = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      fetch.mockResponses(
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: {
                  status: '201',
                  location:
                    '/fhir/Composition/9633042c-ca34-4b9f-959b-9d16909fd85c/_history/ad390bed-c88f-4a3b-b861-31798c88b405'
                }
              }
            ],
            type: 'transaction-response'
          })
        ],
        [
          JSON.stringify({
            resourceType: 'Bundle',
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
                        code: 'DEATH'
                      }
                    ]
                  },
                  extension: [
                    {
                      url: 'http://opencrvs.org/specs/extension/regLastUser',
                      valueReference: { reference: 'DUMMY' }
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
                      system: 'http://opencrvs.org/specs/id/death-tracking-id',
                      value: 'D1mW7jA'
                    },
                    {
                      system:
                        'http://opencrvs.org/specs/id/death-registration-number',
                      value: '2019123265B1234569'
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
        ]
      )
      // @ts-ignore
      const result = await resolvers.Mutation.createDeathRegistration(
        {},
        { details },
        {
          Authorization: `Bearer ${token}`
        }
      )

      expect(result).toBeDefined()
      expect(result).toBe('2019123265B1234569')
    })
  })
  describe('createBirthRegistration()', () => {
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
    it('posts a fhir bundle', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: {
                  status: '201',
                  location:
                    '/fhir/Composition/9633042c-ca34-4b9f-959b-9d16909fd85c/_history/ad390bed-c88f-4a3b-b861-31798c88b405'
                }
              }
            ],
            type: 'transaction-response'
          })
        ],
        [
          JSON.stringify({
            id: '1648b1fb-bad4-4b98-b8a3-bd7ceee496b6',
            resourceType: 'Composition',
            identifier: {
              system: 'urn:ietf:rfc:3986',
              value: 'BewpkiM'
            }
          })
        ]
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

    it('posts a fhir bundle as registrar', async () => {
      const token = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      fetch.mockResponses(
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: {
                  status: '201',
                  location:
                    '/fhir/Composition/9633042c-ca34-4b9f-959b-9d16909fd85c/_history/ad390bed-c88f-4a3b-b861-31798c88b405'
                }
              }
            ],
            type: 'transaction-response'
          })
        ],
        [
          JSON.stringify({
            resourceType: 'Bundle',
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
                      valueReference: { reference: 'DUMMY' }
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
                    },
                    {
                      system:
                        'http://opencrvs.org/specs/id/birth-registration-number',
                      value: '2019123265B1234569'
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
        ]
      )
      // @ts-ignore
      const result = await resolvers.Mutation.createBirthRegistration(
        {},
        { details },
        {
          Authorization: `Bearer ${token}`
        }
      )

      expect(result).toBeDefined()
      expect(result).toBe('2019123265B1234569')
    })

    it('throws an error when invalid composition is returned', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: {
                  status: '201',
                  location:
                    '/fhir/Composition/9633042c-ca34-4b9f-959b-9d16909fd85c/_history/ad390bed-c88f-4a3b-b861-31798c88b405'
                }
              }
            ],
            type: 'transaction-response'
          })
        ],
        [
          JSON.stringify({
            id: '1648b1fb-bad4-4b98-b8a3-bd7ceee496b6',
            resourceType: 'Composition'
          })
        ]
      )
      // @ts-ignore
      await expect(
        resolvers.Mutation.createBirthRegistration({}, { details })
      ).rejects.toThrowError(
        'getTrackingIdFromResponse: Invalid composition or composition has no identifier'
      )
    })

    it("throws an error when the response isn't what we expect", async () => {
      fetch.mockResponseOnce(JSON.stringify({ unexpected: true }))
      await expect(
        // @ts-ignore
        resolvers.Mutation.createBirthRegistration({}, { details })
      ).rejects.toThrowError('FHIR did not send a valid response')
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
                      valueReference: { reference: 'DUMMY' }
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
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: {
                  location:
                    'Task/ba0412c6-5125-4447-bd32-fb5cf336ddbc/_history/ba0412c6-5125-4447-bd32-fb5cf336ddbc'
                }
              }
            ]
          })
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
  })
  describe('markBirthAsRegistered()', () => {
    it('updates status successfully when only composition id is sent', async () => {
      const compositionID = 'cd168e0b-0817-4880-a67f-35de777460a5'
      fetch.mockResponses(
        [
          JSON.stringify({
            resourceType: 'Bundle',
            id: '0a84365d-1925-40cf-a48b-17fcf3425040',
            meta: {
              lastUpdated: '2018-12-13T03:55:12.629+00:00'
            },
            type: 'searchset',
            total: 1,
            link: [
              {
                relation: 'self',
                url:
                  'http://localhost:3447/fhir/Task?focus=Composition/cd168e0b-0817-4880-a67f-35de777460a5'
              }
            ],
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/Task/86f72aee-eb58-45c6-b9b2-93f6a344315e',
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
                  identifier: [
                    {
                      system: 'http://opencrvs.org/specs/id/paper-form-id',
                      value: '23423'
                    },
                    {
                      system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                      value: 'BlAqHa7'
                    }
                  ],
                  extension: [
                    {
                      url: 'http://opencrvs.org/specs/extension/contact-person',
                      valueString: 'MOTHER'
                    },
                    {
                      url: 'http://opencrvs.org/specs/extension/regLastUser',
                      valueReference: {
                        reference:
                          'Practitioner/34562b20-718f-4272-9596-66cb89f2fe7b'
                      }
                    },
                    {
                      url:
                        'http://opencrvs.org/specs/extension/regLastLocation',
                      valueReference: {
                        reference:
                          'Location/71a2f856-3e6a-4bf7-97bd-145d4ab187fa'
                      }
                    },
                    {
                      url: 'http://opencrvs.org/specs/extension/regLastOffice',
                      valueReference: {
                        reference:
                          'Location/71a2f856-3e6a-4bf7-97bd-145d4ab187fa'
                      }
                    }
                  ],
                  lastModified: '2018-12-11T11:55:46.775Z',
                  note: [
                    {
                      text: '',
                      time: '2018-12-11T11:55:46.775Z',
                      authorString:
                        'Practitioner/34562b20-718f-4272-9596-66cb89f2fe7b'
                    }
                  ],
                  focus: {
                    reference:
                      'Composition/cd168e0b-0817-4880-a67f-35de777460a5'
                  },
                  businessStatus: {
                    coding: [
                      {
                        system: 'http://opencrvs.org/specs/reg-status',
                        code: 'DECLARED'
                      }
                    ]
                  },
                  meta: {
                    lastUpdated: '2018-12-11T12:29:48.862+00:00',
                    versionId: '6086dbf7-3772-463a-a920-4694ccb70152'
                  },
                  id: '86f72aee-eb58-45c6-b9b2-93f6a344315e'
                }
              }
            ]
          })
        ],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: { location: 'Task/12423/_history/1' }
              }
            ]
          })
        ],
        [
          JSON.stringify({
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
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/paper-form-id',
                value: '23423'
              },
              {
                system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                value: 'BlAqHa7'
              },
              {
                system:
                  'http://opencrvs.org/specs/id/birth-registration-number',
                value: '2018333417123456786'
              }
            ],
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/contact-person',
                valueString: 'MOTHER'
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastUser',
                valueReference: {
                  reference: 'Practitioner/34562b20-718f-4272-9596-66cb89f2fe7b'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastLocation',
                valueReference: {
                  reference: 'Location/71a2f856-3e6a-4bf7-97bd-145d4ab187fa'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastOffice',
                valueReference: {
                  reference: 'Location/71a2f856-3e6a-4bf7-97bd-145d4ab187fa'
                }
              }
            ],
            lastModified: '2018-12-11T11:55:46.775Z',
            note: [
              {
                text: '',
                time: '2018-12-11T11:55:46.775Z',
                authorString:
                  'Practitioner/34562b20-718f-4272-9596-66cb89f2fe7b'
              }
            ],
            focus: {
              reference: 'Composition/cd168e0b-0817-4880-a67f-35de777460a5'
            },
            businessStatus: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/reg-status',
                  code: 'DECLARED'
                }
              ]
            },
            meta: {
              lastUpdated: '2018-12-11T12:29:48.862+00:00',
              versionId: '6086dbf7-3772-463a-a920-4694ccb70152'
            },
            id: '86f72aee-eb58-45c6-b9b2-93f6a344315e'
          })
        ]
      )
      const result = await resolvers.Mutation.markBirthAsRegistered(
        {},
        { id: compositionID }
      )

      expect(result).toBeDefined()
      expect(result).toBe('2018333417123456786')
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })
    it('throws error if no task entry found given id', async () => {
      const compositionID = 'cd168e0b-0817-4880-a67f-35de777460a5'
      fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          id: 'd2ca298f-662f-4086-a8c5-697517a2b5a3',
          meta: {
            lastUpdated: '2018-12-13T04:02:42.003+00:00'
          },
          type: 'searchset',
          total: 0,
          link: [
            {
              relation: 'self',
              url:
                'http://localhost:3447/fhir/Task?focus=Composition/cd168e0b-0817-4880-a67f-35de777460a5s'
            }
          ],
          entry: []
        })
      )
      expect(
        resolvers.Mutation.markBirthAsRegistered({}, { id: compositionID })
      ).rejects.toThrowError('Task does not exist')
    })
    it('throws error if workflow doesnot send BirthRegistrationNumber as response', async () => {
      const compositionID = 'cd168e0b-0817-4880-a67f-35de777460a5'
      fetch.mockResponses(
        [
          JSON.stringify({
            resourceType: 'Bundle',
            id: 'd2ca298f-662f-4086-a8c5-697517a2b5a3',
            meta: {
              lastUpdated: '2018-12-13T04:02:42.003+00:00'
            },
            type: 'searchset',
            total: 0,
            link: [
              {
                relation: 'self',
                url:
                  'http://localhost:3447/fhir/Task?focus=Composition/cd168e0b-0817-4880-a67f-35de777460a5s'
              }
            ],
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/Task/86f72aee-eb58-45c6-b9b2-93f6a344315e',
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
                  identifier: [
                    {
                      system: 'http://opencrvs.org/specs/id/paper-form-id',
                      value: '23423'
                    },
                    {
                      system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                      value: 'BlAqHa7'
                    }
                  ],
                  extension: [
                    {
                      url: 'http://opencrvs.org/specs/extension/contact-person',
                      valueString: 'MOTHER'
                    },
                    {
                      url: 'http://opencrvs.org/specs/extension/regLastUser',
                      valueReference: {
                        reference:
                          'Practitioner/34562b20-718f-4272-9596-66cb89f2fe7b'
                      }
                    },
                    {
                      url:
                        'http://opencrvs.org/specs/extension/regLastLocation',
                      valueReference: {
                        reference:
                          'Location/71a2f856-3e6a-4bf7-97bd-145d4ab187fa'
                      }
                    },
                    {
                      url: 'http://opencrvs.org/specs/extension/regLastOffice',
                      valueReference: {
                        reference:
                          'Location/71a2f856-3e6a-4bf7-97bd-145d4ab187fa'
                      }
                    }
                  ],
                  lastModified: '2018-12-11T11:55:46.775Z',
                  note: [
                    {
                      text: '',
                      time: '2018-12-11T11:55:46.775Z',
                      authorString:
                        'Practitioner/34562b20-718f-4272-9596-66cb89f2fe7b'
                    }
                  ],
                  focus: {
                    reference:
                      'Composition/cd168e0b-0817-4880-a67f-35de777460a5'
                  },
                  businessStatus: {
                    coding: [
                      {
                        system: 'http://opencrvs.org/specs/reg-status',
                        code: 'DECLARED'
                      }
                    ]
                  },
                  meta: {
                    lastUpdated: '2018-12-11T12:29:48.862+00:00',
                    versionId: '6086dbf7-3772-463a-a920-4694ccb70152'
                  },
                  id: '86f72aee-eb58-45c6-b9b2-93f6a344315e'
                }
              }
            ]
          })
        ],
        [JSON.stringify({ SomethingDifferent: '2018333417123456786' })]
      )
      expect(
        resolvers.Mutation.markBirthAsRegistered({}, { id: compositionID })
      ).rejects.toThrowError('FHIR did not send a valid response')
    })
  })
  describe('updateBirthRegistration()', () => {
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
    it('posts a fhir bundle', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: { location: 'Patient/12423/_history/1' }
            }
          ]
        })
      )
      // @ts-ignore
      const result = await resolvers.Mutation.updateBirthRegistration(
        {},
        { details }
      )

      expect(result).toBeDefined()
      expect(result).toBe('1')
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })

    it("throws an error when the response isn't what we expect", async () => {
      fetch.mockResponseOnce(JSON.stringify({ unexpected: true }))
      await expect(
        // @ts-ignore
        resolvers.Mutation.updateBirthRegistration({}, { details })
      ).rejects.toThrowError('FHIR did not send a valid response')
    })
  })
  describe('markBirthAsCertified()', () => {
    const details = {
      child: {
        name: [{ use: 'en', firstNames: 'অনিক', familyName: 'হক' }]
      },
      mother: {
        name: [{ use: 'en', firstNames: 'তাহসিনা', familyName: 'হক' }],
        telecom: [{ system: 'phone', value: '+8801622688231' }]
      },
      registration: {
        contact: 'MOTHER',
        certificates: [
          {
            collector: {
              relationship: 'MOTHER'
            },
            hasShowedVerifiedDocument: true,
            data: 'DUMMY'
          }
        ]
      }
    }
    it('posts a fhir bundle', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: { location: 'Patient/12423/_history/1' }
            }
          ]
        })
      )
      // @ts-ignore
      const result = await resolvers.Mutation.markBirthAsCertified(
        {},
        { details }
      )

      expect(result).toBeDefined()
      expect(result).toBe('1')
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })

    it("throws an error when the response isn't what we expect", async () => {
      fetch.mockResponseOnce(JSON.stringify({ unexpected: true }))
      await expect(
        // @ts-ignore
        resolvers.Mutation.markBirthAsCertified({}, { details })
      ).rejects.toThrowError('FHIR did not send a valid response')
    })
  })
  describe('queryRegistrationByIdentifier()', async () => {
    it('returns registration', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                resource: {
                  resourceType: 'Task',

                  focus: {
                    reference:
                      'Composition/80b90ac3-1032-4f98-af64-627d2b7443f3'
                  },
                  id: 'e2324ee0-6e6f-46df-be93-12d4d8df600f'
                }
              }
            ]
          })
        ],
        [
          JSON.stringify({
            id: '80b90ac3-1032-4f98-af64-627d2b7443f3'
          })
        ]
      )
      // @ts-ignore
      const composition = await resolvers.Query.queryRegistrationByIdentifier(
        {},
        { identifier: '2019333494BAQFYEG6' }
      )
      expect(composition).toBeDefined()
      expect(composition.id).toBe('80b90ac3-1032-4f98-af64-627d2b7443f3')
    })
    it("throws an error when the response isn't what we expect", async () => {
      fetch.mockResponseOnce(JSON.stringify({ unexpected: true }))
      await expect(
        // @ts-ignore
        resolvers.Query.queryRegistrationByIdentifier(
          {},
          { identifier: '2019333494BAQFYEG6' }
        )
      ).rejects.toThrowError(
        'Task does not exist for identifer 2019333494BAQFYEG6'
      )
    })

    it('throws an error when task doesnt have composition reference', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              resource: {
                id: 'e2324ee0-6e6f-46df-be93-12d4d8df600f'
              }
            }
          ]
        })
      )
      await expect(
        // @ts-ignore
        resolvers.Query.queryRegistrationByIdentifier(
          {},
          { identifier: '2019333494BAQFYEG6' }
        )
      ).rejects.toThrowError('Composition reference not found')
    })
  })

  describe('queryPersonByIdentifier()', async () => {
    it('returns person', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          id: '7ea15b04-961d-4a33-a50c-16f6464aab0e',
          link: [
            {
              relation: 'self',
              url: 'http://localhost:3447/fhir/Patient?identifier=1234567898765'
            }
          ],
          entry: [
            {
              resource: {
                resourceType: 'Patient',

                name: [
                  {
                    use: 'bn',
                    given: ['গায়ত্রী'],
                    family: ['স্পিভক']
                  },
                  {
                    use: 'en',
                    given: ['Gayatri'],
                    family: ['Spivak']
                  }
                ],

                id: '96d2f69a-2572-46b1-a390-9b722265d037'
              }
            }
          ]
        })
      )
      // @ts-ignore
      const composition = await resolvers.Query.queryPersonByIdentifier(
        {},
        { identifier: '1234567898765' }
      )
      expect(composition).toBeDefined()
      expect(composition.id).toBe('96d2f69a-2572-46b1-a390-9b722265d037')
    })
    it("throws an error when the response isn't what we expect", async () => {
      fetch.mockResponseOnce(JSON.stringify({ unexpected: true }))
      await expect(
        // @ts-ignore
        resolvers.Query.queryPersonByIdentifier(
          {},
          { identifier: '1234567898765' }
        )
      ).rejects.toThrowError(
        'Person does not exist for identifer 1234567898765'
      )
    })
  })
})
