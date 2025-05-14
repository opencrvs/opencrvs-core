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

import { env } from '@search/environment'

export const HOST = env.HOST
export const PORT = env.PORT
export const ES_HOST = env.ES_HOST
export const FHIR_URL = env.FHIR_URL
export const CERT_PUBLIC_KEY_PATH = env.CERT_PUBLIC_KEY_PATH
export const USER_MANAGEMENT_URL = env.USER_MANAGEMENT_URL
export const MATCH_SCORE_THRESHOLD = env.MATCH_SCORE_THRESHOLD
export const SENTRY_DSN = process.env.SENTRY_DSN
export const OPENCRVS_INDEX_NAME = env.OPENCRVS_INDEX_NAME
export const DEFAULT_TIMEOUT = 600000
export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'
export const APPLICATION_CONFIG_URL = env.APPLICATION_CONFIG_URL

export const HEARTH_MONGO_URL = env.HEARTH_MONGO_URL
