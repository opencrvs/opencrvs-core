/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
window.config = {
  API_GATEWAY_URL: 'http://localhost:7070/',
  BACKGROUND_SYNC_BROADCAST_CHANNEL: 'backgroundSynBroadCastChannel',
  COUNTRY: 'zmb',
  COUNTRY_LOGO_FILE: 'logo.png',
  DESKTOP_TIME_OUT_MILLISECONDS: 900000, // 15 mins
  HEALTH_FACILITY_FILTER: 'DISTRICT',
  LANGUAGES: 'en',
  LOGIN_URL: 'http://localhost:3020',
  RESOURCES_URL: 'http://localhost:3040/zmb',
  CERTIFICATE_PRINT_CHARGE_FREE_PERIOD: 36500, // 100 years =  (100 * 365) days
  CERTIFICATE_PRINT_CHARGE_UP_LIMIT: 36500, // 100 years =  (100 * 365) days
  CERTIFICATE_PRINT_LOWEST_CHARGE: 0,
  CERTIFICATE_PRINT_HIGHEST_CHARGE: 0,
  UI_POLLING_INTERVAL: 5000,
  SENTRY: 'https://f892d643aab642108f44e2d1795706bc@sentry.io/1774604',
  LOGROCKET: 'opencrvs-foundation/opencrvs-zambia'
}
