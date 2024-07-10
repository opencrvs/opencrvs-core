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
export const FHIR_URL = 'http://localhost:3447/fhir'
export const CERT_PUBLIC_KEY_PATH = './test/cert.key.pub'
export const USER_MANAGEMENT_URL = 'http://localhost:3030/'
export const SEARCH_URL = 'http://localhost:9090/'
export const METRICS_URL = 'http://localhost:1050/'
export const DOCUMENTS_URL = 'http://localhost:9050'
export const NOTIFICATION_SERVICE_URL = 'http://localhost:2020/'
export const APPLICATION_CONFIG_URL = 'http://localhost:2021/'
export const COUNTRY_CONFIG_URL = 'http://localhost:3040'
export const MOSIP_TOKEN_SEEDER_URL = 'http://localhost:8085'
export const WEBHOOKS_URL = 'http://localhost:2525/'
export function getDefaultLanguage() {
  return 'en'
}
