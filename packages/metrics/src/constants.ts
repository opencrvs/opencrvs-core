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
import { join } from 'path'

export const HOST = process.env.METRICS_HOST || '0.0.0.0'
export const PORT = process.env.METRICS_PORT || 1050
export const fhirUrl = process.env.FHIR_URL || 'http://localhost:3447/fhir/'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const COUNTRY_CONFIG_URL =
  process.env.COUNTRY_CONFIG_URL || 'http://localhost:3040'
export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030'
export const DOCUMENTS_URL =
  process.env.DOCUMENTS_URL || 'http://localhost:9050'
export const SENTRY_DSN = process.env.SENTRY_DSN
export const PRODUCTION = process.env.NODE_ENV === 'production'
export const QA_ENV = process.env.QA_ENV || false
export const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/metrics'
export const SEARCH_URL = process.env.SEARCH_URL || 'http://localhost:9090/'
export const EXPECTED_BIRTH_REGISTRATION_IN_DAYS =
  process.env.EXPECTED_BIRTH_REGISTRATION_IN_DAYS || 45
export const CONFIG_API_URL =
  process.env.CONFIG_API_URL || 'http://localhost:2021'
export const DEFAULT_TIMEOUT = 600000
export const VS_EXPORT_SCRIPT_PATH =
  process.env.NODE_ENV === 'production'
    ? './build/dist/src/scripts/VSExportGenerator.js'
    : './src/scripts/VSExportGenerator.ts'

export const BIRTH_REPORT_PATH =
  process.env.NODE_ENV === 'production'
    ? '/usr/src/app/packages/metrics/src/scripts/Birth_Report.csv'
    : join(__dirname, '../src/scripts/Birth_Report.csv')
export const DEATH_REPORT_PATH =
  process.env.NODE_ENV === 'production'
    ? '/usr/src/app/packages/metrics/src/scripts/Death_Report.csv'
    : join(__dirname, '../src/scripts/Death_Report.csv')
export const HEARTH_MONGO_URL =
  process.env.HEARTH_MONGO_URL || 'mongodb://localhost/hearth-dev'

export const DASHBOARD_MONGO_URL =
  process.env.DASHBOARD_MONGO_URL || 'mongodb://localhost/performance'
