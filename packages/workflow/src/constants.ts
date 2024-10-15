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

const env = cleanEnv(process.env, {
  REDIS_HOST: str({ devDefault: 'localhost' }),
  HOST: str({ default: '0.0.0.0' }),
  PORT: num({ default: 5050 }),
  FHIR_URL: url({ devDefault: 'http://localhost:3447/fhir' }),
  APPLICATION_CONFIG_URL: url({ devDefault: 'http://localhost:2021/' }),
  NOTIFICATION_SERVICE_URL: url({ devDefault: 'http://localhost:2020/' }),
  SEARCH_URL: url({ devDefault: 'http://localhost:9090/' }),
  WEBHOOKS_URL: url({ devDefault: 'http://localhost:2525/' }),
  METRICS_URL: url({ devDefault: 'http://localhost:1050/' }),
  MOSIP_TOKEN_SEEDER_URL: url({ default: 'http://localhost:8085' }),
  COUNTRY_CONFIG_URL: url({ devDefault: 'http://localhost:3040' }),
  CERT_PUBLIC_KEY_PATH: str({ default: '../../.secrets/public-key.pem' }),
  DOCUMENTS_URL: url({ default: 'http://localhost:9050' }),
  USER_MANAGEMENT_URL: url({ devDefault: 'http://localhost:3030/' }),
  SENTRY_DSN: str({ default: '' }),
  DEFAULT_TIMEOUT: num({ default: 600000 }),
  LANGUAGES: str({ default: 'en,fr' })
})

export const {
  REDIS_HOST,
  HOST,
  PORT,
  FHIR_URL,
  APPLICATION_CONFIG_URL,
  NOTIFICATION_SERVICE_URL,
  SEARCH_URL,
  WEBHOOKS_URL,
  METRICS_URL,
  MOSIP_TOKEN_SEEDER_URL,
  COUNTRY_CONFIG_URL,
  CERT_PUBLIC_KEY_PATH,
  DOCUMENTS_URL,
  USER_MANAGEMENT_URL,
  SENTRY_DSN,
  DEFAULT_TIMEOUT
} = env

function getAvailableLanguages() {
  return env.LANGUAGES.split(',')
}

export function getDefaultLanguage() {
  return getAvailableLanguages()[0]
}
