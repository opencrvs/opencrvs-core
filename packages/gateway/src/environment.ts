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
import { cleanEnv, str, port, url, bool, num } from 'envalid'

export const env = cleanEnv(process.env, {
  REDIS_HOST: str({ devDefault: 'localhost' }),
  HOST: str({ devDefault: '0.0.0.0' }),
  PORT: port({ default: 7070 }),
  DOMAIN: str({ devDefault: '*' }),
  LOGIN_URL: url({ devDefault: 'http://localhost:3020/' }),
  CLIENT_APP_URL: url({ devDefault: 'http://localhost:3000/' }),
  FHIR_URL: url({
    devDefault: 'http://localhost:3447/fhir'
  }),
  CERT_PUBLIC_KEY_PATH: str({
    devDefault: '../../.secrets/public-key.pem'
  }),
  SEARCH_URL: url({ devDefault: 'http://localhost:9090/' }),
  METRICS_URL: url({ devDefault: 'http://localhost:1050' }),
  AUTH_URL: url({ devDefault: 'http://localhost:4040' }),
  USER_MANAGEMENT_URL: url({ devDefault: 'http://localhost:3030/' }),
  WEBHOOKS_URL: url({ devDefault: 'http://localhost:2525/' }),
  APPLICATION_CONFIG_URL: url({ devDefault: 'http://localhost:2021/' }),
  NOTIFICATION_URL: url({ devDefault: 'http://localhost:2020/' }),
  WORKFLOW_URL: url({ devDefault: 'http://localhost:5050/' }),
  EVENTS_URL: url({ devDefault: 'http://localhost:5555/' }),
  COUNTRY_CONFIG_URL: url({ devDefault: 'http://localhost:3040' }),
  DOCUMENTS_URL: url({ devDefault: 'http://localhost:9050' }),
  DISABLE_RATE_LIMIT: bool({
    default: false,
    desc: 'Disables the Redis-based rate limiting globally'
  }),
  SENTRY_DSN: str({ default: undefined }),
  QA_ENV: bool({ default: false }),
  CHECK_INVALID_TOKEN: bool({
    devDefault: false,
    desc: 'Check if the token has been invalidated in the auth service before it has expired'
  }),
  LANGUAGES: str({ devDefault: 'bn,en' }),
  COUNTRY: str({ devDefault: 'FAR' }),
  CONFIG_TOKEN_EXPIRY_SECONDS: num({ default: 604800 }), // 1 week
  CONFIG_SMS_CODE_EXPIRY_SECONDS: num({ default: 600 }), // 10 minutes
  CONFIG_SYSTEM_TOKEN_EXPIRY_SECONDS: num({ default: 600 }), // 10 minutes
  MINIO_BUCKET: str({ devDefault: 'ocrvs' })
})
