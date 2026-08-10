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

/*
 * Kept in its own setup file, listed before `setupTests.ts`: modules such as
 * `utils/countries` read `window.config` while they are being evaluated, and
 * `setupTests.ts` imports the application before it reaches any statement of
 * its own, so a stub declared there would come too late.
 */
const config = {
  APPLICATION_NAME: 'Farajaland CRVS',
  COUNTRY: 'BGD',
  CURRENCY: {
    isoCode: 'ZMW',
    languagesAndCountry: ['en-ZM']
  },
  ADMIN_STRUCTURE: [
    {
      id: 'province',
      label: {
        id: 'field.address.province.label',
        defaultMessage: 'Province',
        description: 'Label for province in address'
      }
    },
    {
      id: 'district',
      label: {
        id: 'field.address.district.label',
        defaultMessage: 'District',
        description: 'Label for district in address'
      }
    }
  ],
  DASHBOARDS: [
    {
      id: 'test',
      title: {
        id: 'navigation.dashboard',
        defaultMessage: 'Test Dashboard',
        description: 'Title for the test dashboard'
      },
      url: '/'
    }
  ],
  FEATURES: {
    V2_EVENTS: false
  },
  LANGUAGES: ['en', 'bn', 'fr'],
  USER_NOTIFICATION_DELIVERY_METHOD: 'sms',
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'sms',
  SENTRY: 'https://2ed906a0ba1c4de2ae3f3f898ec9df0b@sentry.io/1774551',
  PHONE_NUMBER_PATTERN: /^01[1-9][0-9]{8}$/
}

vi.stubGlobal('config', config)
