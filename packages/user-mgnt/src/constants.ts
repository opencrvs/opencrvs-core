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
export const HOST = process.env.HOST || 'localhost'
export const PORT = process.env.PORT || 3030
export const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost/user-mgnt'
export const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:2020/'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const SENTRY_DSN = process.env.SENTRY_DSN
export const QA_ENV = process.env.QA_ENV || false
export const RECORD_SEARCH_QUOTA =
  Number(process.env.RECORD_SEARCH_QUOTA) || 2000

export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:5001/fhir'
export const DEFAULT_TIMEOUT = 600000
export const METRICS_URL = process.env.METRICS_URL || 'http://localhost:1050'

export const NATIONAL_ID_OIDP_BASE_URL =
  process.env.NATIONAL_ID_OIDP_BASE_URL || null // e.g. https://api.esignet.io/v1/idp

export const NATIONAL_ID_OIDP_REST_URL =
  process.env.NATIONAL_ID_OIDP_REST_URL || null

export const NATIONAL_ID_OIDP_CLIENT_ID =
  process.env.NATIONAL_ID_OIDP_CLIENT_ID || null

export const NATIONAL_ID_OIDP_ESSENTIAL_CLAIMS =
  process.env.NATIONAL_ID_OIDP_ESSENTIAL_CLAIMS || null // e.g. given_name,family_name

export const NATIONAL_ID_OIDP_VOLUNTARY_CLAIMS =
  process.env.NATIONAL_ID_OIDP_VOLUNTARY_CLAIMS || null
