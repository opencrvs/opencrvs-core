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
export function createServerWithEnvironment(env: Record<string, string>) {
  jest.resetModules()
  process.env = { ...process.env, ...env, LOG_LEVEL: 'error' }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('../server').createServer()
}

export function createProductionEnvironmentServer() {
  return createServerWithEnvironment({
    NODE_ENV: 'production',
    AUTH_HOST: '0.0.0.0',
    AUTH_PORT: '4040',
    CLIENT_APP_URL: 'http://localhost:3000/',
    COUNTRY_CONFIG_URL: 'http://localhost:3040/',
    COUNTRY_CONFIG_URL_INTERNAL: 'http://localhost:3040/',
    DOMAIN: '*',
    LOGIN_URL: 'http://localhost:3020/',
    METRICS_URL: 'http://localhost:1050',
    NOTIFICATION_SERVICE_URL: 'http://localhost:2020/',
    REDIS_HOST: 'localhost',
    USER_MANAGEMENT_URL: 'http://localhost:3030/'
  })
}
