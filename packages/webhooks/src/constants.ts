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
import { env } from '@webhooks/environment'

export const QUEUE_NAME = 'NOTIFY_URL'
export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'
export const DEFAULT_TIMEOUT = 600000

export const MONGO_URL = env.MONGO_URL
export const HOST = env.HOST
export const PORT = env.PORT
export const USER_MANAGEMENT_URL = env.USER_MANAGEMENT_URL
export const CERT_PUBLIC_KEY_PATH = env.CERT_PUBLIC_KEY_PATH

export const SENTRY_DSN = env.SENTRY_DSN
export const PRODUCTION = env.isProd
export const QA_ENV = env.QA_ENV

export const AUTH_URL = env.AUTH_URL
export const FHIR_URL = env.FHIR_URL

export const CHECK_INVALID_TOKEN = env.CHECK_INVALID_TOKEN
export const REDIS_HOST = env.REDIS_HOST
export const REDIS_PASSWORD = env.REDIS_PASSWORD
