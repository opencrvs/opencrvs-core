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
import { resolvers as appResolvers } from '@gateway/features/registration/root-resolvers'
import { UserInputError } from '@gateway/utils/graphql-errors'
import { mockTaskBundle } from '@gateway/utils/testUtils'
import { DOWNLOADED_EXTENSION_URL } from '@opencrvs/commons/types'
import { readFileSync } from 'fs'
import * as fetchAny from 'jest-fetch-mock'
import { sign } from 'jsonwebtoken'
import { SCOPES } from '@opencrvs/commons/authentication'
import RecordsAPI from '@gateway/features/fhir/recordsAPI'

const fetch = fetchAny as fetchAny.FetchMock
const resolvers = appResolvers as any
const registerCertifyToken = sign(
  {
    scope: [SCOPES.RECORD_REGISTER, SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES]
  },
  readFileSync('./test/cert.key'),
  {
    subject: '121221',
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:gateway-user'
  }
)

const validateToken = sign(
  { scope: [SCOPES.RECORD_SUBMIT_FOR_APPROVAL] },
  readFileSync('./test/cert.key'),
  {
    subject: '121221',
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:gateway-user'
  }
)

const declareToken = sign(
  {
    scope: [
      SCOPES.RECORD_DECLARE_BIRTH,
      SCOPES.RECORD_DECLARE_DEATH,
      SCOPES.RECORD_DECLARE_MARRIAGE
    ]
  },
  readFileSync('./test/cert.key'),
  {
    subject: '121221',
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:gateway-user'
  }
)

const certifyToken = sign(
  { scope: [SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES] },
  readFileSync('./test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:gateway-user'
  }
)

const unassignToken = sign(
  { scope: [SCOPES.RECORD_UNASSIGN_OTHERS] },
  readFileSync('./test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:gateway-user'
  }
)

const authHeaderRegCert = {
  Authorization: `Bearer ${registerCertifyToken}`
}

const authHeaderValidate = {
  Authorization: `Bearer ${validateToken}`
}

const authHeaderCertify = {
  Authorization: `Bearer ${certifyToken}`
}

const authHeaderNotRegCert = {
  Authorization: `Bearer ${declareToken}`
}

const authHeaderUnassignOthers = {
  Authorization: `Bearer ${unassignToken}`
}

const mockUserDetails = {
  _id: 'ba7022f0ff4822',
  name: [
    {
      use: 'en',
      given: ['Sakib Al'],
      family: ['Hasan']
    }
  ],
  username: 'sakibal.hasan',
  mobile: '+8801711111111',
  email: 'test@test.org',
  passwordHash:
    'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
  salt: '12345',
  role: { labels: [{ lang: 'en', label: 'FIELD_AGENT' }] },
  status: 'active',
  practitionerId: '2d11389d-f58e-4d47-a562-b934f1b85936',
  primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
  creationDate: 1559054406433
}

const mockLocation = {
  resourceType: 'Location',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/internal-id',
      value: 'HEALTH_FACILITY_di3U5u7F8Y3'
    }
  ],
  name: 'Ibombo Rural Health Centre',
  alias: ['Ibombo Rural Health Centre'],
  status: 'active',
  mode: 'instance',
  partOf: {
    reference: 'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a'
  },
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/location-type',
        code: 'HEALTH_FACILITY'
      }
    ]
  },
  physicalType: {
    coding: [
      {
        code: 'bu',
        display: 'Building'
      }
    ]
  },
  meta: {
    lastUpdated: '2023-09-13T12:36:07.539+00:00',
    versionId: 'f55ebb42-d52c-4245-842b-b759cfb54143'
  },
  _transforms: {
    meta: {
      lastUpdated: '2023-09-13T12:36:07.539Z'
    }
  },
  _request: {
    method: 'POST'
  },
  id: '79776844-b606-40e9-8358-7d82147f702a'
}

const mockContext = {
  headers: authHeaderRegCert,
  dataSources: {
    locationsAPI: { getLocation: () => mockLocation },
    usersAPI: { getUserById: () => mockUserDetails },
    recordsAPI: new RecordsAPI()
  }
}

beforeEach(() => {
  fetch.resetMocks()
})

describe('Registration root resolvers', () => {
  describe('fetchBirthRegistration()', () => {
    it('returns the record in the OpenCRVS format', async () => {
      const mockTaskOfComposition = JSON.stringify({
        id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce',
        entry: [
          {
            fullUrl:
              'http://localhost:3447/fhir/Task/10b082d6-e152-4391-b1ef-d88586b049b8/_history/80c56eba-9dc1-4d03-aebe-118a7390c8c0',
            resource: {
              resourceType: 'Task',
              status: 'ready',
              code: {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/types',
                    code: 'BIRTH'
                  }
                ]
              },
              focus: {
                reference: 'Composition/0411ff3d-78a4-4348-8eb7-b023a0ee6dce'
              },
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/draft-id',
                  value: '0b760582-9f9b-4793-a8e3-1022c91c4052'
                },
                {
                  system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                  value: 'BIU2VLU'
                }
              ],
              extension: [
                {
                  url: 'http://opencrvs.org/specs/extension/contact-person',
                  valueString: 'MOTHER'
                },
                {
                  url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
                  valueString: '+260725632525'
                },
                {
                  url: 'http://opencrvs.org/specs/extension/regLastUser',
                  valueReference: {
                    reference:
                      'Practitioner/aa5fe4e2-9a89-4ab8-b4f1-2cd4471a7e2c'
                  }
                },
                {
                  url: 'http://opencrvs.org/specs/extension/regLastOffice',
                  valueReference: {
                    reference: 'Location/497449a0-4f38-426f-b183-93bebfae9b8b'
                  }
                },
                {
                  url: DOWNLOADED_EXTENSION_URL,
                  valueString: 'DECLARED'
                }
              ],
              lastModified: '2022-02-16T13:07:22.445Z',
              businessStatus: {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/reg-status',
                    code: 'DECLARED'
                  }
                ]
              },
              meta: {
                lastUpdated: '2022-02-22T06:55:13.928+00:00',
                versionId: '80c56eba-9dc1-4d03-aebe-118a7390c8c0'
              },
              id: '10b082d6-e152-4391-b1ef-d88586b049b8'
            }
          }
        ]
      })
      const mockPost = JSON.stringify({
        id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce'
      })
      fetch.mockResponses(
        [mockTaskOfComposition, { status: 200 }],
        [mockPost, { status: 200 }],
        [mockPost, { status: 200 }]
      )
      const record = await resolvers.Query.fetchBirthRegistration(
        {},
        { id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce' },
        mockContext
      )
      expect(record).toBeDefined()
      expect(record.id).toBe('0411ff3d-78a4-4348-8eb7-b023a0ee6dce')
    })

    it('throws error if user does not have register or validate scope', async () => {
      await expect(
        resolvers.Query!.fetchBirthRegistration(
          {},
          { id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce' },
          authHeaderCertify
        )
      ).rejects.toThrowError('User does not have enough scope')
    })
  })
  describe('fetchDeathRegistration()', () => {
    it('returns the record in the OpenCRVS format', async () => {
      const mockTaskOfComposition = JSON.stringify({
        id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce',
        entry: [
          {
            fullUrl:
              'http://localhost:3447/fhir/Task/10b082d6-e152-4391-b1ef-d88586b049b8/_history/80c56eba-9dc1-4d03-aebe-118a7390c8c0',
            resource: {
              resourceType: 'Task',
              status: 'ready',
              code: {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/types',
                    code: 'BIRTH'
                  }
                ]
              },
              focus: {
                reference: 'Composition/0411ff3d-78a4-4348-8eb7-b023a0ee6dce'
              },
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/draft-id',
                  value: '0b760582-9f9b-4793-a8e3-1022c91c4052'
                },
                {
                  system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                  value: 'BIU2VLU'
                }
              ],
              extension: [
                {
                  url: 'http://opencrvs.org/specs/extension/contact-person',
                  valueString: 'MOTHER'
                },
                {
                  url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
                  valueString: '+260725632525'
                },
                {
                  url: 'http://opencrvs.org/specs/extension/regLastUser',
                  valueReference: {
                    reference:
                      'Practitioner/aa5fe4e2-9a89-4ab8-b4f1-2cd4471a7e2c'
                  }
                },
                {
                  url: 'http://opencrvs.org/specs/extension/regLastOffice',
                  valueReference: {
                    reference: 'Location/497449a0-4f38-426f-b183-93bebfae9b8b'
                  }
                },
                {
                  url: DOWNLOADED_EXTENSION_URL,
                  valueString: 'DECLARED'
                }
              ],
              lastModified: '2022-02-16T13:07:22.445Z',
              businessStatus: {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/reg-status',
                    code: 'DECLARED'
                  }
                ]
              },
              meta: {
                lastUpdated: '2022-02-22T06:55:13.928+00:00',
                versionId: '80c56eba-9dc1-4d03-aebe-118a7390c8c0'
              },
              id: '10b082d6-e152-4391-b1ef-d88586b049b8'
            }
          }
        ]
      })
      const mockPost = JSON.stringify({
        id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce'
      })
      fetch.mockResponses(
        [mockTaskOfComposition, { status: 200 }],
        [mockPost, { status: 200 }],
        [mockPost, { status: 200 }]
      )

      const composition = await resolvers.Query.fetchDeathRegistration(
        {},
        { id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce' },
        mockContext
      )
      expect(composition).toBeDefined()
      expect(composition.id).toBe('0411ff3d-78a4-4348-8eb7-b023a0ee6dce')
    })

    it('throws error if user does not have register or validate scope', async () => {
      await expect(
        resolvers.Query!.fetchDeathRegistration(
          {},
          { id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce' },
          authHeaderCertify
        )
      ).rejects.toThrowError('User does not have enough scope')
    })
  })
  describe('fetchMarriageRegistration()', () => {
    it('returns the record in the OpenCRVS format', async () => {
      const mockTaskOfComposition = JSON.stringify({
        id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce',
        entry: [
          {
            fullUrl:
              'http://localhost:3447/fhir/Task/10b082d6-e152-4391-b1ef-d88586b049b8/_history/80c56eba-9dc1-4d03-aebe-118a7390c8c0',
            resource: {
              resourceType: 'Task',
              status: 'ready',
              code: {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/types',
                    code: 'MARRIAGE'
                  }
                ]
              },
              focus: {
                reference: 'Composition/0411ff3d-78a4-4348-8eb7-b023a0ee6dce'
              },
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/draft-id',
                  value: '0b760582-9f9b-4793-a8e3-1022c91c4052'
                },
                {
                  system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                  value: 'BIU2VLU'
                }
              ],
              extension: [
                {
                  url: 'http://opencrvs.org/specs/extension/contact-person',
                  valueString: 'BRIDE'
                },
                {
                  url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
                  valueString: '+260725632525'
                },
                {
                  url: 'http://opencrvs.org/specs/extension/regLastUser',
                  valueReference: {
                    reference:
                      'Practitioner/aa5fe4e2-9a89-4ab8-b4f1-2cd4471a7e2c'
                  }
                },
                {
                  url: 'http://opencrvs.org/specs/extension/regLastOffice',
                  valueReference: {
                    reference: 'Location/497449a0-4f38-426f-b183-93bebfae9b8b'
                  }
                },
                {
                  url: DOWNLOADED_EXTENSION_URL,
                  valueString: 'DECLARED'
                }
              ],
              lastModified: '2022-02-16T13:07:22.445Z',
              businessStatus: {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/reg-status',
                    code: 'DECLARED'
                  }
                ]
              },
              meta: {
                lastUpdated: '2022-02-22T06:55:13.928+00:00',
                versionId: '80c56eba-9dc1-4d03-aebe-118a7390c8c0'
              },
              id: '10b082d6-e152-4391-b1ef-d88586b049b8'
            }
          }
        ]
      })
      const mockPost = JSON.stringify({
        id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce'
      })
      fetch.mockResponses(
        [mockTaskOfComposition, { status: 200 }],
        [mockPost, { status: 200 }],
        [mockPost, { status: 200 }]
      )

      const composition = await resolvers.Query.fetchMarriageRegistration(
        {},
        { id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce' },
        mockContext
      )
      expect(composition).toBeDefined()
      expect(composition.id).toBe('0411ff3d-78a4-4348-8eb7-b023a0ee6dce')
    })

    it('throws error if user does not have register or validate scope', async () => {
      await expect(
        resolvers.Query!.fetchMarriageRegistration(
          {},
          { id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce' },
          authHeaderCertify
        )
      ).rejects.toThrowError('User does not have enough scope')
    })
  })
  describe('fetchRegistration()', () => {
    it('returns the record in the OpenCRVS format', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce'
        })
      )
      const composition = await resolvers.Query!.fetchRegistration(
        {},
        { id: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce' },
        mockContext
      )
      expect(composition).toBeDefined()
      expect(composition.id).toBe('0411ff3d-78a4-4348-8eb7-b023a0ee6dce')
    })
  })
  describe('createDeathRegistration()', () => {
    const details = {
      deceased: {
        name: [{ use: 'bn', firstNames: 'অনিক', familyName: 'হক' }]
      },
      registration: {
        draftId: '9633042c-ca34-4b9f-959b-9d16909fd85c'
      }
    }
    it('posts a fhir bundle', async () => {
      fetch.mockResponses([
        JSON.stringify({
          compositionId: '9633042c-ca34-4b9f-959b-9d16909fd85c',
          isPotentiallyDuplicate: false,
          trackingId: 'DewpkiM'
        }),
        { status: 200 }
      ])
      const result = await resolvers.Mutation!.createDeathRegistration(
        {},
        { details },
        { headers: undefined }
      )

      expect(result).toBeDefined()
      expect(result).toEqual({
        compositionId: '9633042c-ca34-4b9f-959b-9d16909fd85c',
        trackingId: 'DewpkiM',
        isPotentiallyDuplicate: false
      })
      expect(result.trackingId.length).toBe(7)
      expect(result.trackingId).toMatch(/^D/)
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
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
      father: {
        name: [{ use: 'en', firstNames: 'তাহসিনা', familyName: 'হক' }]
      },
      registration: { informantType: 'MOTHER' }
    }
    it('posts a fhir bundle', async () => {
      fetch.mockResponses([
        JSON.stringify({
          compositionId: '9633042c-ca34-4b9f-959b-9d16909fd85c',
          trackingId: 'BewpkiM',
          isPotentiallyDuplicate: false
        }),
        { status: 200 }
      ])
      const result = await resolvers.Mutation!.createBirthRegistration(
        {},
        { details },
        { headers: undefined }
      )

      expect(result).toBeDefined()
      expect(result).toEqual({
        compositionId: '9633042c-ca34-4b9f-959b-9d16909fd85c',
        trackingId: 'BewpkiM',
        isPotentiallyDuplicate: false
      })
      expect(result.trackingId.length).toBe(7)
      expect(result.trackingId).toMatch(/^B/)
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })
  })
  describe('markEventAsVoided()', () => {
    it('throws error if user does not have register or validate scope', async () => {
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }]
      )
      const id = 'df3fb104-4c2c-486f-97b3-edbeabcd4422'
      const reason = 'Misspelling'
      const comment = 'Family name misspelled'
      await expect(
        resolvers.Mutation!.markEventAsVoided(
          {},
          { id, reason, comment },
          { headers: authHeaderNotRegCert }
        )
      ).rejects.toThrowError('User does not have enough scope')
    })
  })

  describe('markEventAsArchived()', () => {
    it('throws error if user does not have register or validate scope', async () => {
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }]
      )
      const id = 'df3fb104-4c2c-486f-97b3-edbeabcd4422'
      await expect(
        resolvers.Mutation!.markEventAsArchived(
          {},
          { id },
          { headers: authHeaderNotRegCert }
        )
      ).rejects.toThrowError('User does not have enough scope')
    })
  })

  describe('markEventAsReinstated()', () => {
    it('throws error if user does not have register or validate scope', async () => {
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }]
      )
      const id = 'df3fb104-4c2c-486f-97b3-edbeabcd4422'
      await expect(
        resolvers.Mutation!.markEventAsReinstated(
          {},
          { id },
          { headers: authHeaderNotRegCert }
        )
      ).rejects.toThrowError('User does not have enough scope')
    })
  })

  describe('markBirthAsValidated()', () => {
    it('updates status successfully when composition id and details both are sent', async () => {
      const compositionID = 'cd168e0b-0817-4880-a67f-35de777460a5'
      const compositionDetails = {
        createdAt: '2019-07-23T07:51:31.883Z',
        child: {
          name: [
            { use: 'bn', familyName: 'স্যাম' },
            { use: 'en', familyName: 'Sam' }
          ],
          gender: 'male',
          birthDate: '2010-01-01',
          _fhirID: '672b825e-7a32-423c-9da3-070d704e8e23'
        },
        mother: {
          multipleBirth: 1,
          identifier: [{ type: 'NATIONAL_ID', id: '1212121212121' }],
          nationality: ['BGD'],
          name: [
            { use: 'bn', familyName: 'জুল' },
            { use: 'en', familyName: 'Jul' }
          ],
          maritalStatus: 'MARRIED',
          address: [
            {
              type: 'PRIMARY_ADDRESS',
              line: [
                '',
                '',
                '',
                '',
                '',
                'f8816522-0a1a-49ca-aa4e-a886a9b056ec'
              ],
              country: 'BGD',
              state: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
              district: '68ba789b-0e6c-4528-a400-4422e142e3dd'
            },
            {
              type: 'SECONDARY_ADDRESS',
              line: [
                '',
                '',
                '',
                '',
                '',
                'f8816522-0a1a-49ca-aa4e-a886a9b056ec'
              ],
              country: 'BGD',
              state: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
              district: '68ba789b-0e6c-4528-a400-4422e142e3dd'
            }
          ],
          _fhirID: '276cbe01-c95a-4c07-9e97-cad2ecc07a25'
        },
        registration: {
          informantType: 'MOTHER',
          contactPhoneNumber: '01712121212',
          _fhirID: '75e734d8-47cf-47b4-9416-fa4c747e1b71',
          trackingId: 'BZ1D4FY',
          status: [{ timestamp: '2019-07-23T07:51:31.906Z' }]
        },
        _fhirIDMap: {
          composition: '20703e32-0e2f-4685-8371-e7448d18de82',
          encounter: '04cd7da2-89b6-4d68-b3c6-b158ce83b0e8',
          observation: {
            birthType: 'c7879d8e-d094-42ed-804a-aeea8aaa7ef8'
          }
        }
      }
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: []
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: { location: 'Task/12423/_history/1' }
              }
            ]
          }),
          { status: 200 }
        ]
      )
      const result = await resolvers.Mutation!.markBirthAsValidated(
        {},
        { id: compositionID, details: compositionDetails },
        { headers: authHeaderValidate }
      )

      expect(result).toBe('cd168e0b-0817-4880-a67f-35de777460a5')
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('updates status successfully when only composition id is sent', async () => {
      const compositionID = 'cd168e0b-0817-4880-a67f-35de777460a5'
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
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
                url: 'http://localhost:3447/fhir/Task?focus=Composition/cd168e0b-0817-4880-a67f-35de777460a5'
              }
            ],
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/Task/86f72aee-eb58-45c6-b9b2-93f6a344315e',
                resource: {
                  resourceType: 'Task',
                  status: 'ready',
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
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: { location: 'Task/12423/_history/1' }
              }
            ]
          }),
          { status: 200 }
        ]
      )
      const result = await resolvers.Mutation!.markBirthAsValidated(
        {},
        { id: compositionID },
        { headers: authHeaderValidate }
      )

      expect(result).toBe('cd168e0b-0817-4880-a67f-35de777460a5')
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })

    it("throws an error when the user doesn't have validate scope", async () => {
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }]
      )
      const compositionID = 'cd168e0b-0817-4880-a67f-35de777460a5'
      await expect(
        resolvers.Mutation!.markBirthAsValidated(
          {},
          { id: compositionID },
          { headers: authHeaderRegCert }
        )
      ).rejects.toThrowError('User does not have enough scope')
    })
  })

  describe('markDeathAsValidated()', () => {
    it('updates status successfully when only composition id and details both are sent', async () => {
      const compositionID = 'cd168e0b-0817-4880-a67f-35de777460a5'
      const compositionDetails = {
        createdAt: '2019-07-23T08:51:50.626Z',
        deceased: {
          identifier: [{ type: 'PASSPORT', id: '111111111' }],
          name: [
            { use: 'bn', familyName: 'টম' },
            { use: 'en', familyName: 'Tom' }
          ],
          nationality: ['BGD'],
          gender: 'male',
          maritalStatus: 'MARRIED',
          birthDate: '1940-01-01',
          address: [
            {
              type: 'PRIMARY_ADDRESS',
              line: [
                '',
                '',
                '',
                '',
                '',
                'f8816522-0a1a-49ca-aa4e-a886a9b056ec'
              ],
              country: 'BGD',
              state: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
              district: '68ba789b-0e6c-4528-a400-4422e142e3dd'
            },
            {
              type: 'SECONDARY_ADDRESS',
              line: [
                '',
                '',
                '',
                '',
                '',
                'f8816522-0a1a-49ca-aa4e-a886a9b056ec'
              ],
              country: 'BGD',
              state: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
              district: '68ba789b-0e6c-4528-a400-4422e142e3dd'
            }
          ],
          _fhirID: 'f4dd0315-9b89-46aa-a52e-68e1cd1f352f',
          deceased: { deceased: true, deathDate: '2010-01-01' }
        },
        informant: {
          identifier: [{ type: 'PASSPORT', id: '222222222' }],
          name: [
            { use: 'bn', familyName: 'জুল' },
            { use: 'en', familyName: 'Jul' }
          ],
          nationality: ['BGD'],
          telecom: [{ system: 'phone', value: '01711111111' }],
          address: [
            {
              type: 'SECONDARY_ADDRESS',
              line: [
                '',
                '',
                '',
                '',
                '',
                'f8816522-0a1a-49ca-aa4e-a886a9b056ec'
              ],
              country: 'BGD',
              state: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
              district: '68ba789b-0e6c-4528-a400-4422e142e3dd'
            },
            {
              type: 'PRIMARY_ADDRESS',
              line: [
                '',
                '',
                '',
                '',
                '',
                'f8816522-0a1a-49ca-aa4e-a886a9b056ec'
              ],
              country: 'BGD',
              state: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
              district: '68ba789b-0e6c-4528-a400-4422e142e3dd'
            }
          ],
          _fhirID: '33960f24-7be1-4db3-beb1-dae5d30a9e53'
        },
        mannerOfDeath: 'NATURAL_CAUSES',
        eventLocation: {
          address: {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'f8816522-0a1a-49ca-aa4e-a886a9b056ec'],
            country: 'BGD',
            state: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
            district: '68ba789b-0e6c-4528-a400-4422e142e3dd'
          },
          type: 'PRIMARY_ADDRESS',
          partOf: 'Location/f8816522-0a1a-49ca-aa4e-a886a9b056ec'
        },
        registration: {
          _fhirID: 'a8c62d2c-9d04-4b0c-b239-5950aa3839ec',
          trackingId: 'DIH14HS'
        },
        _fhirIDMap: { composition: 'd7e273e7-e4d3-4342-905e-f3514fa2c10a' }
      }
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                resource: {
                  identifier: [{ type: 'PASSPORT', id: '111111111' }],
                  name: [
                    { use: 'bn', familyName: 'টম' },
                    { use: 'en', familyName: 'Tom' }
                  ],
                  nationality: ['BGD'],
                  gender: 'male',
                  maritalStatus: 'MARRIED',
                  birthDate: '1940-01-01',
                  address: [
                    {
                      type: 'PRIMARY_ADDRESS',
                      line: [
                        '',
                        '',
                        '',
                        '',
                        '',
                        'f8816522-0a1a-49ca-aa4e-a886a9b056ec'
                      ],
                      country: 'BGD',
                      state: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
                      district: '68ba789b-0e6c-4528-a400-4422e142e3dd'
                    },
                    {
                      type: 'SECONDARY_ADDRESS',
                      line: [
                        '',
                        '',
                        '',
                        '',
                        '',
                        'f8816522-0a1a-49ca-aa4e-a886a9b056ec'
                      ],
                      country: 'BGD',
                      state: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
                      district: '68ba789b-0e6c-4528-a400-4422e142e3dd'
                    }
                  ],
                  id: 'f4dd0315-9b89-46aa-a52e-68e1cd1f352f',
                  deceased: { deceased: true, deathDate: '2010-01-01' }
                }
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: { location: 'Task/12423/_history/1' }
              }
            ]
          }),
          { status: 200 }
        ]
      )
      const result = await resolvers.Mutation!.markDeathAsValidated(
        {},
        { id: compositionID, details: compositionDetails },
        { headers: authHeaderValidate }
      )

      expect(result).toBe('cd168e0b-0817-4880-a67f-35de777460a5')
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('updates status successfully when only composition id is sent', async () => {
      const compositionID = 'cd168e0b-0817-4880-a67f-35de777460a5'
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
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
                url: 'http://localhost:3447/fhir/Task?focus=Composition/cd168e0b-0817-4880-a67f-35de777460a5'
              }
            ],
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/Task/86f72aee-eb58-45c6-b9b2-93f6a344315e',
                resource: {
                  resourceType: 'Task',
                  status: 'ready',
                  code: {
                    coding: [
                      {
                        system: 'http://opencrvs.org/specs/types',
                        code: 'DEATH'
                      }
                    ]
                  },
                  identifier: [
                    {
                      system: 'http://opencrvs.org/specs/id/death-tracking-id',
                      value: 'DlAqHa7'
                    }
                  ],
                  extension: [
                    {
                      url: 'http://opencrvs.org/specs/extension/regLastUser',
                      valueReference: {
                        reference:
                          'Practitioner/34562b20-718f-4272-9596-66cb89f2fe7b'
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
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: { location: 'Task/12423/_history/1' }
              }
            ]
          }),
          { status: 200 }
        ]
      )
      const result = await resolvers.Mutation!.markDeathAsValidated(
        {},
        { id: compositionID },
        { headers: authHeaderValidate }
      )

      expect(result).toBe('cd168e0b-0817-4880-a67f-35de777460a5')
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })

    it("throws an error when the user doesn't have validate scope", async () => {
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }]
      )
      const compositionID = 'cd168e0b-0817-4880-a67f-35de777460a5'
      await expect(
        resolvers.Mutation!.markDeathAsValidated(
          {},
          { id: compositionID },
          { headers: authHeaderRegCert }
        )
      ).rejects.toThrowError('User does not have enough scope')
    })
  })

  describe('markBirthAsRegistered()', () => {
    it('throws error if has no assigned user id', async () => {
      fetch.mockResponses(
        [JSON.stringify(mockTaskBundle), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({}), { status: 200 }]
      )
      const compositionID = 'cd168e0b-0817-4880-a67f-35de777460a5'

      expect(
        resolvers.Mutation!.markBirthAsRegistered(
          {},
          { id: compositionID },
          { headers: authHeaderRegCert }
        )
      ).rejects.toThrowError('User has been unassigned')
    })

    it("throws an error when the user doesn't have register scope", async () => {
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }]
      )
      const compositionID = 'cd168e0b-0817-4880-a67f-35de777460a5'
      await expect(
        resolvers.Mutation!.markBirthAsRegistered(
          {},
          { id: compositionID },
          { headers: authHeaderNotRegCert }
        )
      ).rejects.toThrowError('User does not have a register scope')
    })
  })
  describe('markDeathAsRegistered', () => {
    it("throws an error when the user doesn't have register scope", async () => {
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }]
      )
      const compositionID = 'cd168e0b-0817-4880-a67f-35de777460a5'
      await expect(
        resolvers.Mutation!.markDeathAsRegistered(
          {},
          { id: compositionID },
          { headers: authHeaderNotRegCert }
        )
      ).rejects.toThrowError('User does not have a register scope')
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
        informantType: 'MOTHER',
        certificates: [
          {
            collector: {
              relationship: 'MOTHER'
            },
            hasShowedVerifiedDocument: true,
            data: 'data:image/png;base64,2324256'
          }
        ]
      }
    }
    it('posts a fhir bundle', async () => {
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify(mockUserDetails), { status: 200 }],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                resource: {
                  id: 'df3fb104-4c2c-486f-97b3-edbeabcd4422',
                  resourceType: 'Composition'
                }
              }
            ]
          }),
          { status: 200 }
        ]
      )
      const id = 'df3fb104-4c2c-486f-97b3-edbeabcd4422'
      const result = await resolvers.Mutation!.markBirthAsCertified(
        {},
        { id, details },
        { headers: authHeaderRegCert }
      )

      expect(result).toBeDefined()
      expect(result).toBe(id)
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })

    it("throws an error when the user doesn't have a certify scope", async () => {
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }]
      )
      const id = 'df3fb104-4c2c-486f-97b3-edbeabcd4422'
      await expect(
        resolvers.Mutation!.markBirthAsCertified(
          {},
          { id, details },
          { headers: authHeaderNotRegCert }
        )
      ).rejects.toThrowError('User does not have enough scope')
    })

    it('throws an error when the user is not assigned to record', async () => {
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121331' }), { status: 200 }]
      )
      const id = 'df3fb104-4c2c-486f-97b3-edbeabcd4422'
      await expect(
        resolvers.Mutation!.markBirthAsCertified(
          {},
          { id, details },
          { headers: authHeaderNotRegCert }
        )
      ).rejects.toThrowError('User is not assigned to the record')
    })
  })
  describe('markDeathAsCertified()', () => {
    const details = {
      deceased: {
        name: [{ use: 'en', firstNames: 'অনিক', familyName: 'হক' }]
      },
      informant: {
        name: [{ use: 'en', firstNames: 'তাহসিনা', familyName: 'হক' }],
        telecom: [{ system: 'phone', value: '+8801622688231' }]
      },
      registration: {
        informantType: 'FATHER',
        certificates: [
          {
            collector: {
              relationship: 'INFORMANT'
            },
            hasShowedVerifiedDocument: true,
            data: 'data:image/png;base64,2324256'
          }
        ]
      }
    }
    it('posts a fhir bundle', async () => {
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify(mockUserDetails), { status: 200 }],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                resource: {
                  id: 'df3fb104-4c2c-486f-97b3-edbeabcd4422',
                  resourceType: 'Composition'
                }
              }
            ]
          }),
          { status: 200 }
        ]
      )

      const id = 'df3fb104-4c2c-486f-97b3-edbeabcd4422'
      const result = await resolvers.Mutation!.markDeathAsCertified(
        {},
        { id, details },
        { headers: authHeaderRegCert }
      )

      expect(result).toBeDefined()
      expect(result).toBe(id)
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })

    it("throws an error when the user doesn't have a certify scope", async () => {
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }]
      )
      await expect(
        resolvers.Mutation!.markDeathAsCertified(
          {},
          { details },
          { headers: authHeaderNotRegCert }
        )
      ).rejects.toThrowError('User does not have enough scope')
    })

    it('throws an error when the user is not assigned to the record', async () => {
      fetch.mockResponses(
        [JSON.stringify({ practitionerId: '121221' }), { status: 200 }],
        [JSON.stringify({ practitionerId: '121331' }), { status: 200 }]
      )
      await expect(
        resolvers.Mutation!.markDeathAsCertified(
          {},
          { details },
          { headers: authHeaderNotRegCert }
        )
      ).rejects.toThrowError('User is not assigned to the record')
    })
  })
  describe('markEventAsNotDuplicate()', () => {
    it("throws an error when the user doesn't have register scope", async () => {
      fetch.mockResponseOnce(JSON.stringify({ practitionerId: '121221' }))
      fetch.mockResponseOnce(JSON.stringify({ practitionerId: '121221' }))

      await expect(
        resolvers.Mutation!.markEventAsNotDuplicate(
          {},
          {
            id: '1648b1fb-bad4-4b98-b8a3-bd7ceee496b6'
          },
          { headers: authHeaderNotRegCert }
        )
      ).rejects.toThrowError('User does not have enough scope')
    })

    it('throws an error when the declaration is not assigned', async () => {
      await expect(
        resolvers.Mutation!.markEventAsNotDuplicate(
          {},
          {
            id: '1648b1fb-bad4-4b98-b8a3-bd7ceee496b6'
          },
          authHeaderNotRegCert
        )
      ).rejects.toThrowError('User has been unassigned')
    })
  })
  describe('queryRegistrationByIdentifier()', () => {
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
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            id: '80b90ac3-1032-4f98-af64-627d2b7443f3'
          }),
          { status: 200 }
        ]
      )
      const composition = await resolvers.Query!.queryRegistrationByIdentifier(
        {},
        { identifier: '2019333494BAQFYEG6' },
        { headers: authHeaderRegCert }
      )
      expect(composition).toBeDefined()
      expect(composition.id).toBe('80b90ac3-1032-4f98-af64-627d2b7443f3')
    })
    it("throws an error when the response isn't what we expect", async () => {
      fetch.mockResponseOnce(JSON.stringify({ unexpected: true }))
      await expect(
        resolvers.Query!.queryRegistrationByIdentifier(
          {},
          { identifier: '2019333494BAQFYEG6' },
          { headers: authHeaderRegCert }
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
        resolvers.Query!.queryRegistrationByIdentifier(
          {},
          { identifier: '2019333494BAQFYEG6' },
          { headers: authHeaderRegCert }
        )
      ).rejects.toThrowError('Composition reference not found')
    })

    it("throws an error when the user doesn't have register or validate scope", async () => {
      await expect(
        resolvers.Query!.queryRegistrationByIdentifier(
          {},
          { identifier: '2019333494BAQFYEG6' },
          authHeaderNotRegCert
        )
      ).rejects.toThrowError('User does not have enough scope')
    })
  })

  describe('queryPersonByIdentifier()', () => {
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
      const composition = await resolvers.Query!.queryPersonByIdentifier(
        {},
        { identifier: '1234567898765' },
        { headers: authHeaderRegCert }
      )
      expect(composition).toBeDefined()
      expect(composition.id).toBe('96d2f69a-2572-46b1-a390-9b722265d037')
    })
    it("throws an error when the response isn't what we expect", async () => {
      fetch.mockResponseOnce(JSON.stringify({ unexpected: true }))
      await expect(
        resolvers.Query!.queryPersonByIdentifier(
          {},
          { identifier: '1234567898765' },
          { headers: authHeaderRegCert }
        )
      ).rejects.toThrowError(
        'Person does not exist for identifer 1234567898765'
      )
    })

    it("throws an error when the user doesn't have required scope", async () => {
      return expect(
        resolvers.Query!.queryPersonByIdentifier(
          {},
          { identifier: '1234567898765' },
          authHeaderCertify
        )
      ).rejects.toThrowError('User does not have enough scope')
    })
  })

  describe('queryPersonByNidIdentifier()', () => {
    const response = {
      data: {
        name: [
          {
            use: 'en',
            family: 'Hasib'
          },
          {
            use: 'bn',
            family: 'হাসিব'
          }
        ],
        gender: 'male'
      },
      operationResult: {
        success: true
      }
    }

    it('returns person with name and gender', async () => {
      fetch.mockResponseOnce(JSON.stringify(response))
      const data = await resolvers.Query!.queryPersonByNidIdentifier(
        {},
        {
          dob: '1992-12-30',
          nid: '1234567898000'
        },
        { headers: authHeaderRegCert }
      )
      expect(data).toBeDefined()
      expect(data).toEqual(response.data)
    })
    it("throws an error when the nid and dob  don't match", async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          operationResult: {
            success: false,
            error: {
              errorMessage:
                'Invalid value for:  No voter matched with given DoB',
              errorCode: 11
            }
          }
        })
      )
      await expect(
        resolvers.Query!.queryPersonByNidIdentifier(
          {},
          {
            dob: '1992-12-30',
            nid: '1234567898000'
          },
          { headers: authHeaderRegCert }
        )
      ).rejects.toThrowError(
        'Invalid value for:  No voter matched with given DoB'
      )
    })

    it("throws an error when the user doesn't have required scope", async () => {
      return expect(
        resolvers.Query!.queryPersonByNidIdentifier(
          {},
          {
            dob: '1992-12-30',
            nid: '1234567898000'
          },
          authHeaderCertify
        )
      ).rejects.toThrowError('User does not have enough scope')
    })
  })

  describe('fetchRegistrationCounts()', () => {
    const response = [
      {
        status: 'IN_PROGRESS',
        count: 5
      },
      {
        status: 'DECLARED',
        count: 3
      },
      {
        status: 'VALIDATED',
        count: 2
      },
      {
        status: 'REGISTERED',
        count: 5
      }
    ]

    it('returns status wise registration counts', async () => {
      fetch.mockResponseOnce(JSON.stringify(response))
      const data = await resolvers.Query!.fetchRegistrationCountByStatus(
        {},
        {
          locationId: '123',
          status: ['IN_PROGRESS', 'DECLARED', 'VALIDATED', 'REGISTERED']
        },
        { headers: authHeaderRegCert }
      )
      expect(data).toBeDefined()
      expect(data.results).toEqual(response)
      expect(data.total).toBe(15)
    })

    it("throws an error when the user doesn't have required scope", async () => {
      return expect(
        resolvers.Query!.fetchRegistrationCountByStatus(
          {},
          {
            locationId: '123',
            status: ['IN_PROGRESS', 'DECLARED', 'VALIDATED', 'REGISTERED']
          },
          authHeaderCertify
        )
      ).rejects.toThrowError('User does not have enough scope')
    })
  })

  describe('AttachmentInput type only accepts image/* mime type', () => {
    it('throws an error if a non-supported file is uploaded', async () => {
      return expect(
        resolvers.Mutation!.createBirthRegistration(
          {},
          {
            details: {
              registration: {
                attachments: [
                  {
                    data: 'data:text/csv;base64,VHlwZSxEYXRldGltZSxBY2NvdW50LEFtb3VudCxWYWx1ZSxSYXRlLEZlZSxTdWIgVHlwZQ0K',
                    subject: 'CHILD',
                    type: 'NOTIFICATION_OF_BIRTH',
                    contentType: 'text/csv'
                  }
                ]
              }
            }
          },
          { headers: undefined }
        )
      ).rejects.toThrow(UserInputError)
    })

    it('throws an error if file base64 headers are manipulated', async () => {
      return expect(
        resolvers.Mutation!.createDeathRegistration(
          {},
          {
            details: {
              registration: {
                attachments: [
                  {
                    data: 'data:image/png;base64,VHlwZSxEYXRldGltZSxBY2NvdW50LEFtb3VudCxWYWx1ZSxSYXRlLEZlZSxTdWIgVHlwZQ0K',
                    contentType: 'text/csv'
                  }
                ]
              }
            }
          },
          { headers: undefined }
        )
      ).rejects.toThrow(UserInputError)
    })
  })
})

describe('markEventAsUnassigned()', () => {
  it('throws error if the record is not assigned to anyone', async () => {
    fetch.mockResponses([JSON.stringify({}), { status: 200 }])
    const id = 'df3fb104-4c2c-486f-97b3-edbeabcd4422'
    await expect(
      resolvers.Mutation!.markEventAsUnassigned(
        {},
        { id },
        { headers: authHeaderNotRegCert }
      )
    ).rejects.toThrowError('User has been unassigned')
  })
  it('throws error if the record is not assigned to user & user does not have unassign-others scope', async () => {
    fetch.mockResponses(
      [JSON.stringify({ practitionerId: 'test-1234' }), { status: 200 }],
      [JSON.stringify({ practitionerId: 'test-3456' }), { status: 200 }]
    )
    const id = 'df3fb104-4c2c-486f-97b3-edbeabcd4422'
    await expect(
      resolvers.Mutation!.markEventAsUnassigned(
        {},
        { id },
        { headers: authHeaderNotRegCert }
      )
    ).rejects.toThrowError(
      'User has been unassigned or does not have required scope'
    )
  })
  it('lets user without unassign-others scope unassign a record if the record is assigned to themselves', async () => {
    fetch.mockResponses(
      [JSON.stringify({ practitionerId: 'test-1234' }), { status: 200 }],
      [JSON.stringify({ practitionerId: 'test-1234' }), { status: 200 }],
      [JSON.stringify(mockTaskBundle), { status: 200 }]
    )
    const id = 'df3fb104-4c2c-486f-97b3-edbeabcd4422'
    expect(
      await resolvers.Mutation!.markEventAsUnassigned(
        {},
        { id },
        { headers: authHeaderNotRegCert }
      )
    ).toEqual('ba0412c6-5125-4447-bd32-fb5cf336ddbc')
  })
  it('lets user with unassign-others scope unassign a record even if assigned to someone else', async () => {
    fetch.mockResponses(
      [JSON.stringify({ practitionerId: 'test-1234' }), { status: 200 }],
      [JSON.stringify({ practitionerId: 'test-4567' }), { status: 200 }],
      [JSON.stringify(mockTaskBundle), { status: 200 }]
    )
    const id = 'df3fb104-4c2c-486f-97b3-edbeabcd4422'
    expect(
      await resolvers.Mutation!.markEventAsUnassigned(
        {},
        { id },
        { headers: authHeaderUnassignOthers }
      )
    ).toEqual('ba0412c6-5125-4447-bd32-fb5cf336ddbc')
  })
})
