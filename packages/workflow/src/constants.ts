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

import { env } from '@workflow/environment'

export const HOST = env.HOST
export const PORT = env.PORT
export const FHIR_URL = env.FHIR_URL
export const APPLICATION_CONFIG_URL = env.APPLICATION_CONFIG_URL

export const NOTIFICATION_SERVICE_URL = env.NOTIFICATION_SERVICE_URL

export const SEARCH_URL = env.SEARCH_URL
export const WEBHOOKS_URL = env.WEBHOOKS_URL
export const METRICS_URL = env.METRICS_URL

export const COUNTRY_CONFIG_URL = env.COUNTRY_CONFIG_URL
export const CERT_PUBLIC_KEY_PATH = env.CERT_PUBLIC_KEY_PATH
export const DOCUMENTS_URL = env.DOCUMENTS_URL
export const USER_MANAGEMENT_URL = env.USER_MANAGEMENT_URL
export const SENTRY_DSN = process.env.SENTRY_DSN
export const AUTH_URL = env.AUTH_URL
export const DEFAULT_TIMEOUT = 600000

function getAvailableLanguages() {
  return env.LANGUAGES.split(',')
}

export function getDefaultLanguage() {
  return getAvailableLanguages()[0]
}
