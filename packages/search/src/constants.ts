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
export const HOST = process.env.HOST || '0.0.0.0'
export const PORT = process.env.PORT || 9090
export const ES_HOST = process.env.ES_HOST || 'localhost:9200'
export const HEARTH_URL = process.env.HEARTH_URL || 'http://localhost:3447/fhir'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030/'
export const MATCH_SCORE_THRESHOLD = 1.0
export const SENTRY_DSN = process.env.SENTRY_DSN
export const OPENCRVS_INDEX_NAME = 'ocrvs'
export const DEFAULT_TIMEOUT = 600000
export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'

export const FLAGGED_AS_POTENTIAL_DUPLICATE = `${OPENCRVS_SPECIFICATION_URL}extension/flaggedAsPotentialDuplicate`
