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
import { http, HttpResponse } from 'msw'
import { env } from '@events/environment'
import { mswServer } from '@events/tests/msw'
import { createTestClient, setupTestCase } from '@events/tests/utils'

describe('config.application', () => {
  test('returns the application configuration, with fields core does not know', async () => {
    const { user } = await setupTestCase()
    mswServer.use(
      http.get(`${env.COUNTRY_CONFIG_URL}/config/application`, () =>
        HttpResponse.json({
          APPLICATION_NAME: 'Farajaland CRS',
          COUNTRY_LOGO: { fileName: 'logo.png', file: '' },
          SYSTEM_IANA_TIMEZONE: 'UTC',
          CURRENCY: { isoCode: 'USD', languagesAndCountry: ['en-US'] },
          ADMIN_STRUCTURE: [],
          PHONE_NUMBER_PATTERN: '^01[1-9][0-9]{8}$',
          USER_NOTIFICATION_DELIVERY_METHOD: 'email',
          INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'email',
          LOGIN_BACKGROUND: { backgroundColor: '36304E' }
        })
      )
    )

    const config = await createTestClient(user).config.application()

    expect(config).toMatchObject({
      APPLICATION_NAME: 'Farajaland CRS',
      SEARCH_DEFAULT_CRITERIA: 'TRACKING_ID',
      LOGIN_BACKGROUND: { backgroundColor: '36304E' }
    })
  })
})
