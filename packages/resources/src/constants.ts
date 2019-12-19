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
export const TEST_SOURCE = `${process.cwd()}/src/tests/`
export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:3447/fhir'
export const ORG_URL = 'http://opencrvs.org'
export const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost/user-mgnt'
export const RESOURCES_HOST = process.env.RESOURCES_HOST || '0.0.0.0'
export const RESOURCES_PORT = process.env.RESOURCES_PORT || 3040
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4040'
export const SENTRY_DSN =
  process.env.SENTRY_DSN ||
  'https://2ed906a0ba1c4de2ae3f3f898ec9df0b@sentry.io/1774551'

// Check if the token has been invalided in the auth service before it has expired
// This needs to be a string to make it easy to pass as an ENV var.
export const CHECK_INVALID_TOKEN = process.env.CHECK_INVALID_TOKEN || 'false'
export const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'test'
// Send registration to BDRIS2 for validation before confirming registration
// This needs to be a string to make it easy to pass as an ENV var.
export const VALIDATE_IN_BDRIS2 = process.env.VALIDATE_IN_BDRIS2 || 'false'
export const CONFIRM_REGISTRATION_URL =
  process.env.CONFIRM_REGISTRATION_URL ||
  'http://localhost:5050/confirm/registration'
