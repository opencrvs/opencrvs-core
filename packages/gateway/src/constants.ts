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

import { env } from '@gateway/environment'

export const AVATAR_API =
  'https://eu.ui-avatars.com/api/?background=DEE5F2&color=222&name='

export const NATIVE_LANGUAGE = (() => {
  const languages = env.LANGUAGES.split(',')
  return languages.find((language) => language !== 'en')
})()

export const DEFAULT_TIMEOUT = 600000

export const REDIS_HOST = env.REDIS_HOST
export const HOST = env.HOST
export const PORT = env.PORT
export const HOSTNAME = env.DOMAIN
export const LOGIN_URL = env.LOGIN_URL
export const CLIENT_APP_URL = env.CLIENT_APP_URL
export const FHIR_URL = env.FHIR_URL.endsWith('/')
  ? env.FHIR_URL
  : env.FHIR_URL + '/'
export const CERT_PUBLIC_KEY_PATH = env.CERT_PUBLIC_KEY_PATH
export const SEARCH_URL = env.SEARCH_URL
export const METRICS_URL = env.METRICS_URL
export const AUTH_URL = env.AUTH_URL
export const USER_MANAGEMENT_URL = env.USER_MANAGEMENT_URL
export const WEBHOOKS_URL = env.WEBHOOKS_URL
export const APPLICATION_CONFIG_URL = env.APPLICATION_CONFIG_URL.endsWith('/')
  ? env.APPLICATION_CONFIG_URL
  : env.APPLICATION_CONFIG_URL + '/'
export const NOTIFICATION_URL = env.NOTIFICATION_URL
export const WORKFLOW_URL = env.WORKFLOW_URL
export const COUNTRY_CONFIG_URL = env.COUNTRY_CONFIG_URL
export const DOCUMENTS_URL = env.DOCUMENTS_URL
export const DISABLE_RATE_LIMIT = env.DISABLE_RATE_LIMIT
export const SENTRY_DSN = env.SENTRY_DSN
export const PRODUCTION = env.isProd
export const QA_ENV = env.QA_ENV
export const CHECK_INVALID_TOKEN = env.CHECK_INVALID_TOKEN
export const DEFAULT_COUNTRY = env.COUNTRY
export const CONFIG_TOKEN_EXPIRY_SECONDS = env.CONFIG_TOKEN_EXPIRY_SECONDS
export const CONFIG_SMS_CODE_EXPIRY_SECONDS = env.CONFIG_SMS_CODE_EXPIRY_SECONDS
export const CONFIG_SYSTEM_TOKEN_EXPIRY_SECONDS =
  env.CONFIG_SYSTEM_TOKEN_EXPIRY_SECONDS
export const MINIO_BUCKET = env.MINIO_BUCKET
