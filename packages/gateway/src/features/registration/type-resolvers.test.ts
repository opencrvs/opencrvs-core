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

import { ApolloServer } from 'apollo-server-hapi'

jest.useFakeTimers('modern').setSystemTime(new Date('2023-10-11T07:24:55.108Z'))

import { IUserModelData } from '@gateway/features/user/type-resolvers'
import { getApolloConfig } from '@gateway/graphql/config'
import { generateQueryForType } from '@gateway/graphql/query-generator'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import {
  BIRTH_BUNDLE,
  DEATH_BUNDLE,
  MARRIAGE_BUNDLE
} from '@opencrvs/commons/fixtures'
import { Context } from '@gateway/graphql/context'
import { getAuthHeader } from '@opencrvs/commons/http'

const MOCK_TOKEN = jwt.sign(
  { scope: ['validate'] },
  readFileSync('./test/cert.key'),
  {
    subject: '121221',
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:gateway-user'
  }
)

const MOCK_USER: IUserModelData = {
  _id: '6501acbe81245ece9e627bf7',
  name: [
    {
      use: 'en',
      given: ['Derrick'],
      family: 'Bulaya'
    }
  ],
  username: 'd.bulaya',
  identifiers: [],
  email: '',
  device: 'Samsung Galaxy S9',
  emailForNotification: 'kalushabw.alya17@gmail.com',
  mobile: '0934343434',
  systemRole: 'LOCAL_REGISTRAR',
  role: {
    labels: [
      {
        lang: 'en',
        label: 'Local Registrar'
      },
      {
        lang: 'fr',
        label: 'Registraire local'
      }
    ]
  },
  practitionerId: '511ab59f-54df-4331-8c22-97062a602154',
  primaryOfficeId: '5faf414c-99e8-47a7-b4d9-d07a02dbc97e',
  catchmentAreaIds: [
    '5faf414c-99e8-47a7-b4d9-d07a02dbc97e',
    'c1ddb556-8b22-4182-9a6c-64358c0e96c9',
    '1a2a2cca-c77c-4c15-8d12-be4e949b2b00'
  ],
  scope: ['register', 'performance', 'certify', 'demo'],
  status: 'active',
  auditHistory: []
}

const MOCK_RESPONSES = {
  'users/6501acbe81245ece9e627bf7/avatar': {
    userName: 'e.test',
    avatarURI: '/mock-avatar-url'
  },
  getUser: MOCK_USER,
  // User's primary office's parent location
  '/Location/c1ddb556-8b22-4182-9a6c-64358c0e96c9': {
    resourceType: 'Location',
    identifier: [
      {
        system: 'http://opencrvs.org/specs/id/internal-id',
        value: 'CRVS_OFFICE_HPGiE9Jjh2r'
      }
    ],
    name: 'HPGiE9Jjh2r',
    alias: ['HPGiE9Jjh2r'],
    status: 'active',
    mode: 'instance',
    partOf: {
      reference: 'Location/0'
    },
    type: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/location-type',
          code: 'CRVS_OFFICE'
        }
      ]
    },
    physicalType: {
      coding: [
        {
          code: 'jdn',
          display: 'Jurisdiction'
        }
      ]
    },
    meta: {
      lastUpdated: '2023-09-13T12:36:08.757+00:00',
      versionId: 'c5e4cf8a-15c6-4bd0-8299-6be0383d5713'
    },
    _transforms: {
      meta: {
        lastUpdated: '2023-09-13T12:36:08.757Z'
      }
    },
    _request: {
      method: 'POST'
    },
    id: 'c1ddb556-8b22-4182-9a6c-64358c0e96c9'
  },
  // User's primary office
  '/Location/5faf414c-99e8-47a7-b4d9-d07a02dbc97e': {
    _id: '6501acb8b91837001d484b6d',
    resourceType: 'Location',
    identifier: [
      {
        system: 'http://opencrvs.org/specs/id/internal-id',
        value: 'CRVS_OFFICE_okQp4uKCz0'
      }
    ],
    name: 'Ilanga District Office',
    alias: ['Ilanga District Office'],
    status: 'active',
    mode: 'instance',
    partOf: {
      reference: 'Location/c1ddb556-8b22-4182-9a6c-64358c0e96c9'
    },
    type: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/location-type',
          code: 'CRVS_OFFICE'
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
      lastUpdated: '2023-09-13T12:36:08.757+00:00',
      versionId: 'c5e4cf8a-15c6-4bd0-8299-6be0383d5713'
    },
    _transforms: {
      meta: {
        lastUpdated: '2023-09-13T12:36:08.757Z'
      }
    },
    _request: {
      method: 'POST'
    },
    id: '5faf414c-99e8-47a7-b4d9-d07a02dbc97e'
  },
  '/PractitionerRole?practitioner=511ab59f-54df-4331-8c22-97062a602154': {
    resourceType: 'PractitionerRole',
    practitioner: {
      reference: 'Practitioner/511ab59f-54df-4331-8c22-97062a602154'
    },
    id: '82ef255e-7b49-4e7c-8851-b3f0b440839a'
  },
  '/Practitioner/511ab59f-54df-4331-8c22-97062a602154': {
    _id: '6501acbcb91837001d484b89',
    resourceType: 'Practitioner',
    identifier: [],
    telecom: [
      {
        system: 'phone',
        value: '0934343434'
      },
      {
        system: 'email',
        value: ''
      }
    ],
    name: [
      {
        use: 'en',
        family: 'Mweene',
        given: ['Kennedy']
      }
    ],
    meta: {
      lastUpdated: '2023-09-13T12:36:12.371+00:00',
      versionId: '61171268-0270-4497-87a4-9c464a9d4257'
    },
    id: '511ab59f-54df-4331-8c22-97062a602154'
  }
}

jest.mock('@gateway/features/registration/utils', () => {
  const originalModule = jest.requireActual(
    '@gateway/features/registration/utils'
  )
  return {
    ...originalModule,
    getPresignedUrlFromUri: () => {
      return Promise.resolve('/mock-presigned-url')
    }
  }
})

jest.mock('@gateway/features/user/utils', () => {
  const originalModule = jest.requireActual('@gateway/features/user/utils')
  return {
    ...originalModule,
    getUser: () => Promise.resolve(MOCK_USER)
  }
})

jest.mock('apollo-datasource-rest', () => {
  function fakeHTTPRequest(url: keyof typeof MOCK_RESPONSES) {
    if (MOCK_RESPONSES[url] !== undefined) {
      return MOCK_RESPONSES[url]
    }
    throw new Error(`No mock for url ${url.toString()}`)
  }
  class MockRESTDataSource {
    baseUrl = ''
    get = fakeHTTPRequest
    post = fakeHTTPRequest

    context = {
      record: BIRTH_BUNDLE
    }
  }
  return {
    RESTDataSource: MockRESTDataSource
  }
})

jest.mock('@gateway/workflow/index', () => {
  const originalModule = jest.requireActual('@gateway/workflow/index')
  return {
    ...originalModule,
    fetchRegistrationForDownloading: jest.fn(() =>
      Promise.resolve(BIRTH_BUNDLE)
    )
  }
})

test('running a full aggregated birth FHIR bundle through resolvers produces a BirthRegistration object', async () => {
  const apolloConfig = getApolloConfig()
  const testServer = new ApolloServer(getApolloConfig())

  const query = `query {
    fetchBirthRegistration(id: "") {
    ${generateQueryForType(apolloConfig.schema!, 'BirthRegistration')}
    }
  }
  `

  const response = await testServer.executeOperation(
    {
      query
    },
    {
      request: {
        auth: {
          isAuthenticated: true,
          credentials: {
            scope: ['register', 'performance', 'certify', 'demo']
          }
        },
        headers: {
          authorization: `Bearer ${MOCK_TOKEN}`
        }
      }
    }
  )
  expect(response.data).toMatchSnapshot()
})

test('running a full aggregated death FHIR bundle through resolvers produces a DeathRegistration object', async () => {
  const apolloConfig = getApolloConfig()

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@gateway/workflow/index').fetchRegistrationForDownloading.mockImplementation(
    () => Promise.resolve(DEATH_BUNDLE)
  )
  const testServer = new ApolloServer({
    ...getApolloConfig(),
    context: async ({ request }): Promise<Omit<Context, 'dataSources'>> => {
      return {
        request,
        headers: getAuthHeader(request),
        presignDocumentUrls: true,
        record: DEATH_BUNDLE as any
      }
    }
  })

  const query = `query {
    fetchDeathRegistration(id: "") {
    ${generateQueryForType(apolloConfig.schema!, 'DeathRegistration')}
    }
  }
  `

  const response = await testServer.executeOperation(
    {
      query
    },
    {
      request: {
        auth: {
          isAuthenticated: true,
          credentials: {
            scope: ['register', 'performance', 'certify', 'demo']
          }
        },
        headers: {
          authorization: `Bearer ${MOCK_TOKEN}`
        }
      }
    }
  )
  expect(response.data).toMatchSnapshot()
})
test('running a full aggregated marriage FHIR bundle through resolvers produces a MarriageRegistration object', async () => {
  const apolloConfig = getApolloConfig()

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@gateway/workflow/index').fetchRegistrationForDownloading.mockImplementation(
    () => Promise.resolve(MARRIAGE_BUNDLE)
  )
  const testServer = new ApolloServer({
    ...getApolloConfig(),
    context: async ({ request }): Promise<Omit<Context, 'dataSources'>> => {
      return {
        request,
        headers: getAuthHeader(request),
        presignDocumentUrls: true,
        record: MARRIAGE_BUNDLE
      }
    }
  })

  const query = `query {
    fetchMarriageRegistration(id: "") {
    ${generateQueryForType(apolloConfig.schema!, 'MarriageRegistration')}
    }
  }
  `

  const response = await testServer.executeOperation(
    {
      query
    },
    {
      request: {
        auth: {
          isAuthenticated: true,
          credentials: {
            scope: ['register', 'performance', 'certify', 'demo']
          }
        },
        headers: {
          authorization: `Bearer ${MOCK_TOKEN}`
        }
      }
    }
  )
  expect(response.data).toMatchSnapshot()
})
