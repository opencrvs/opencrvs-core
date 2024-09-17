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
  HOST: str({ devDefault: '0.0.0.0' }),
  PORT: num({ default: 9090 }),
  ES_HOST: str({ devDefault: 'localhost:9200' }),
  FHIR_URL: url({ devDefault: 'http://localhost:3447/fhir' }),
  CERT_PUBLIC_KEY_PATH: str({ default: '../../.secrets/public-key.pem' }),
  USER_MANAGEMENT_URL: url({ devDefault: 'http://localhost:3030/' }),
  MATCH_SCORE_THRESHOLD: num({ default: 1.0 }),
  SENTRY_DSN: str({ default: '' }),
  OPENCRVS_INDEX_NAME: str({ default: 'ocrvs' }),
  DEFAULT_TIMEOUT: num({ default: 600000 }),

  APPLICATION_CONFIG_URL: url({ devDefault: 'http://localhost:2021/' }),
  HEARTH_MONGO_URL: url({ devDefault: 'mongodb://localhost/hearth-dev' }),
  REDIS_HOST: str({ devDefault: 'localhost' })
})

export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'

export const {
  HOST,
  PORT,
  ES_HOST,
  FHIR_URL,
  CERT_PUBLIC_KEY_PATH,
  USER_MANAGEMENT_URL,
  MATCH_SCORE_THRESHOLD,
  SENTRY_DSN,
  OPENCRVS_INDEX_NAME,
  DEFAULT_TIMEOUT,
  APPLICATION_CONFIG_URL,
  HEARTH_MONGO_URL,
  REDIS_HOST
} = env
