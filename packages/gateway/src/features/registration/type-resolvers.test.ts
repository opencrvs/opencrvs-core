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
import { BIRTH_BUNDLE } from '@opencrvs/commons/fixtures'

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
  getUser: MOCK_USER
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
    fetchRegistration: jest.fn(() => Promise.resolve(BIRTH_BUNDLE))
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
