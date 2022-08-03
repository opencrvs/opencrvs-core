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
export const HOST = process.env.HOST || '0.0.0.0'
export const PORT = process.env.PORT || 5050
export const HEARTH_URL = process.env.HEARTH_URL || 'http://localhost:3447/fhir'
export const OPENHIM_URL = process.env.OPENHIM_URL || 'http://localhost:5001'
export const APPLICATION_CONFIG_URL =
  process.env.APPLICATION_CONFIG_URL || 'http://localhost:2021/'
export const VALIDATING_EXTERNALLY = process.env.VALIDATING_EXTERNALLY || false
export const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:2020/'

export const RESOURCE_SERVICE_URL =
  process.env.RESOURCE_SERVICE_URL || `http://localhost:3040/`
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'

export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030/'
export const SENTRY_DSN =
  process.env.SENTRY_DSN ||
  'https://2ed906a0ba1c4de2ae3f3f898ec9df0b@sentry.io/1774551'

function getAvailableLanguages() {
  const LANGUAGES = (process.env.LANGUAGES && process.env.LANGUAGES) || 'bn,en'
  return LANGUAGES.split(',')
}

export function getDefaultLanguage() {
  return getAvailableLanguages()[0]
}
export const DEFAULT_TIMEOUT = 600000
