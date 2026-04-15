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
import { cleanEnv, str, num, url } from 'envalid'
import { join } from 'path'

const env = cleanEnv(process.env, {
  METRICS_HOST: str({ default: '0.0.0.0' }),
  METRICS_PORT: num({ default: 1050 }),
  CERT_PUBLIC_KEY_PATH: str({ default: '../../.secrets/public-key.pem' }),
  COUNTRY_CONFIG_URL: url({ devDefault: 'http://localhost:3040' }),
  USER_MANAGEMENT_URL: url({ devDefault: 'http://localhost:3030' }),
  DOCUMENTS_URL: url({ devDefault: 'http://localhost:9050' }),
  SENTRY_DSN: str({ default: '' }),
  MONGO_URL: str({ devDefault: 'mongodb://localhost/metrics' }),
  EXPECTED_BIRTH_REGISTRATION_IN_DAYS: num({ default: 45 }),
  DEFAULT_TIMEOUT: num({ default: 600000 }),
  DASHBOARD_MONGO_URL: str({ devDefault: 'mongodb://localhost/performance' })
})

export const {
  METRICS_HOST: HOST,
  METRICS_PORT: PORT,
  CERT_PUBLIC_KEY_PATH,
  COUNTRY_CONFIG_URL,
  USER_MANAGEMENT_URL,
  DOCUMENTS_URL,
  SENTRY_DSN,
  isProd: PRODUCTION,
  MONGO_URL,
  EXPECTED_BIRTH_REGISTRATION_IN_DAYS,
  DEFAULT_TIMEOUT,
  DASHBOARD_MONGO_URL
} = env


export const BIRTH_REPORT_PATH = PRODUCTION
  ? '/usr/src/app/packages/metrics/src/scripts/Birth_Report.csv'
  : join(__dirname, '../src/scripts/Birth_Report.csv')

export const DEATH_REPORT_PATH = PRODUCTION
  ? '/usr/src/app/packages/metrics/src/scripts/Death_Report.csv'
  : join(__dirname, '../src/scripts/Death_Report.csv')
