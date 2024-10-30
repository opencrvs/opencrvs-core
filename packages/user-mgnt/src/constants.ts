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

import { env } from './environment'

export const DEFAULT_TIMEOUT = 600000

export const HOST = env.HOST
export const PORT = env.PORT
export const MONGO_URL = env.MONGO_URL
export const NOTIFICATION_SERVICE_URL = env.NOTIFICATION_SERVICE_URL
export const APPLICATION_CONFIG_URL = env.APPLICATION_CONFIG_URL
export const DOCUMENTS_URL = env.DOCUMENTS_URL
export const CERT_PUBLIC_KEY_PATH = env.CERT_PUBLIC_KEY_PATH
export const SENTRY_DSN = env.SENTRY_DSN
export const QA_ENV = env.QA_ENV
export const RECORD_SEARCH_QUOTA = env.RECORD_SEARCH_QUOTA

export const FHIR_URL = env.FHIR_URL
export const METRICS_URL = env.METRICS_URL
