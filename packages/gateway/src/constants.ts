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
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
export const HOST = process.env.HOST || '0.0.0.0'
export const PORT = process.env.PORT || 7070
export const HOSTNAME = process.env.DOMAIN || '*'
export const LOGIN_URL = process.env.LOGIN_URL || 'http://localhost:3020/'
export const CLIENT_APP_URL =
  process.env.CLIENT_APP_URL || 'http://localhost:3000/'
export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:3447/fhir'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
// Services
export const SEARCH_URL = process.env.SEARCH_URL || 'http://localhost:9090/'
export const METRICS_URL = process.env.METRICS_URL || 'http://localhost:1050'
export const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4040'
export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030/'
export const WEBHOOKS_URL = process.env.WEBHOOKS_URL || 'http://localhost:2525/'
export const APPLICATION_CONFIG_URL =
  process.env.APPLICATION_CONFIG_URL || 'http://localhost:2021/'
export const NOTIFICATION_URL =
  process.env.NOTIFICATION_URL || 'http://localhost:2020/'
export const WORKFLOW_URL = process.env.WORKFLOW_URL || 'http://localhost:5050/'
export const COUNTRY_CONFIG_URL =
  process.env.COUNTRY_CONFIG_URL || 'http://localhost:3040'
export const DOCUMENTS_URL =
  process.env.DOCUMENTS_URL || 'http://localhost:9050'
/** Disables the Redis-based rate limiting globally */
export const DISABLE_RATE_LIMIT = Boolean(process.env.DISABLE_RATE_LIMIT)

export const SENTRY_DSN = process.env.SENTRY_DSN

export const PRODUCTION = process.env.NODE_ENV === 'production'
export const QA_ENV = process.env.QA_ENV || false

export const AVATAR_API =
  'https://eu.ui-avatars.com/api/?background=DEE5F2&color=222&name='

// Check if the token has been invalided in the auth service before it has expired
// This needs to be a string to make it easy to pass as an ENV var.
export const CHECK_INVALID_TOKEN = process.env.CHECK_INVALID_TOKEN || 'false'
export function getLanguages() {
  const LANGUAGES = process.env.LANGUAGES || 'bn,en'
  return LANGUAGES.split(',')
}
export const DEFAULT_COUNTRY = process.env.COUNTRY || 'FAR'
export const NATIVE_LANGUAGE = (() => {
  const languages = getLanguages()
  return languages.find((language) => language !== 'en')
})()

export const CONFIG_TOKEN_EXPIRY_SECONDS = process.env
  .CONFIG_TOKEN_EXPIRY_SECONDS
  ? parseInt(process.env.CONFIG_TOKEN_EXPIRY_SECONDS, 10)
  : 604800 // 1 week

export const CONFIG_SMS_CODE_EXPIRY_SECONDS = process.env
  .CONFIG_SMS_CODE_EXPIRY_SECONDS
  ? parseInt(process.env.CONFIG_SMS_CODE_EXPIRY_SECONDS, 10)
  : 600

export const CONFIG_SYSTEM_TOKEN_EXPIRY_SECONDS = process.env
  .CONFIG_SYSTEM_TOKEN_EXPIRY_SECONDS
  ? parseInt(process.env.CONFIG_SYSTEM_TOKEN_EXPIRY_SECONDS, 10)
  : 600
export const DEFAULT_TIMEOUT = 600000
export const MINIO_BUCKET = process.env.MINIO_BUCKET || 'ocrvs'

export const OIDP_BASE_URL = process.env.NATIONAL_ID_OIDP_BASE_URL
export const OIDP_REST_URL = process.env.NATIONAL_ID_OIDP_REST_URL
/** Base64 encoded RS256 JSON Web Key */
export const OIDP_CLIENT_PRIVATE_KEY =
  process.env.NATIONAL_ID_OIDP_CLIENT_PRIVATE_KEY
/** Value for "aud" claim when getting access token for fetching Open ID provider user info */
export const OIDP_JWT_AUD_CLAIM = process.env.NATIONAL_ID_OIDP_JWT_AUD_CLAIM
