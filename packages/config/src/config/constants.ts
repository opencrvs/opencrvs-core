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
export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'
export const HOST = process.env.HOST || 'localhost'
export const HOSTNAME = process.env.HOSTNAME || '*'
export const PORT = process.env.PORT || 2021
// Services
export const SEARCH_URL = process.env.SEARCH_URL || 'http://localhost:9090/'
export const METRICS_URL = process.env.METRICS_URL || 'http://localhost:1050'
export const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4040'
export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:5001/fhir'
export const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost/application-config'
export const SENTRY_DSN =
  process.env.SENTRY_DSN ||
  'https://2ed906a0ba1c4de2ae3f3f898ec9df0b@sentry.io/1774551'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'

// Check if the token has been invalided in the auth service before it has expired
// This needs to be a string to make it easy to pass as an ENV var.
export const CHECK_INVALID_TOKEN = process.env.CHECK_INVALID_TOKEN || 'false'
export const DEFAULT_TIMEOUT = 600000
