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
import { cleanEnv, str, num } from 'envalid'

const env = cleanEnv(process.env, {
  DOCUMENTS_HOST: str({ default: '0.0.0.0' }),
  DOCUMENTS_PORT: num({ default: 9050 }),
  CERT_PUBLIC_KEY_PATH: str({ default: '../../.secrets/public-key.pem' }),
  DEFAULT_TIMEOUT: num({ default: 600000 })
})

export const HOST = env.DOCUMENTS_HOST
export const PORT = env.DOCUMENTS_PORT
export const CERT_PUBLIC_KEY_PATH = env.CERT_PUBLIC_KEY_PATH
export const SENTRY_DSN = process.env.SENTRY_DSN
export const DEFAULT_TIMEOUT = env.DEFAULT_TIMEOUT
export const PRODUCTION = env.isProd
