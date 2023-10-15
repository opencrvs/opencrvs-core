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
import { vi } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'
// eslint-disable-next-line import/no-unassigned-import
import '@testing-library/jest-dom'
import { server } from '@client/mocks/setupServer'

const config = {
  API_GATEWAY_URL: 'http://localhost:7070/',
  CONFIG_API_URL: 'http://localhost:2021',
  LOGIN_URL: 'http://localhost:3020',
  AUTH_URL: 'http://localhost:4040',
  MINIO_BUCKET: 'ocrvs',
  COUNTRY_CONFIG_URL: 'http://localhost:3040',
  APPLICATION_NAME: 'Farajaland CRVS',
  BIRTH: {
    REGISTRATION_TARGET: 45,
    LATE_REGISTRATION_TARGET: 365,
    FEE: {
      ON_TIME: 0,
      LATE: 0,
      DELAYED: 0
    }
  },
  COUNTRY: 'BGD',
  CURRENCY: {
    isoCode: 'ZMW',
    languagesAndCountry: ['en-ZM']
  },
  DEATH: {
    REGISTRATION_TARGET: 45,
    FEE: {
      ON_TIME: 0,
      DELAYED: 0
    }
  },
  FEATURES: {
    DEATH_REGISTRATION: true,
    MARRIAGE_REGISTRATION: true,
    EXTERNAL_VALIDATION_WORKQUEUE: false,
    INFORMANT_SIGNATURE: true,
    PRINT_DECLARATION: true
  },
  LANGUAGES: 'en,bn,fr',
  USER_NOTIFICATION_DELIVERY_METHOD: 'sms',
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'sms',
  SENTRY: 'https://2ed906a0ba1c4de2ae3f3f898ec9df0b@sentry.io/1774551',
  NID_NUMBER_PATTERN: /^[0-9]{9}$/,
  PHONE_NUMBER_PATTERN: /^01[1-9][0-9]{8}$/
}

vi.stubGlobal('config', config)

const fetchMock = createFetchMock(vi)
fetchMock.enableMocks()

vi.mock('./storage')
vi.mock('http://localhost:3040/conditionals.js', () => ({ conditionals: {} }))
vi.mock('http://localhost:3040/validators.js', () => ({}))

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterAll(() => {
  server.close()
})
