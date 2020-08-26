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
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
export const AUTH_HOST = process.env.AUTH_HOST || '0.0.0.0'
export const AUTH_PORT = process.env.AUTH_PORT || 4040
export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030/'

export const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:2020/'

export const CERT_PRIVATE_KEY_PATH =
  (process.env.CERT_PRIVATE_KEY_PATH as string) ||
  '../../.secrets/private-key.pem'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const SENTRY_DSN =
  process.env.SENTRY_DSN ||
  'https://2ed906a0ba1c4de2ae3f3f898ec9df0b@sentry.io/1774551'

export const PRODUCTION = process.env.NODE_ENV === 'production'
export const QA_ENV = process.env.QA_ENV || false

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

export const WEB_USER_JWT_AUDIENCES = [
  'opencrvs:auth-user',
  'opencrvs:user-mgnt-user',
  'opencrvs:hearth-user',
  'opencrvs:gateway-user',
  'opencrvs:notification-user',
  'opencrvs:workflow-user',
  'opencrvs:search-user',
  'opencrvs:metrics-user',
  'opencrvs:resources-user',
  'opencrvs:webhooks-user'
]
export const NOTIFICATION_API_USER_AUDIENCE = 'opencrvs:notification-api-user'
export const VALIDATOR_API_USER_AUDIENCE = 'opencrvs:validator-api-user'
export const CHATBOT_API_USER_AUDIENCE = 'opencrvs:chatbot-api-user'
export const NATIONAL_ID_USER_AUDIENCE = 'opencrvs:nationalId-api-user'
export const JWT_ISSUER = 'opencrvs:auth-service'
export const INVALID_TOKEN_NAMESPACE = 'invalidToken'
