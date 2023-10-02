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
export const PORT = process.env.PORT || 2020

/*
  For these locales sms content will not be sent as unicoded payload
  In future based on our experience on different countries we can add more locals here
*/
export const NON_UNICODED_LANGUAGES = ['en']

export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'

export const SENTRY_DSN = process.env.SENTRY_DSN

export const COUNTRY_CONFIG_URL =
  process.env.COUNTRY_CONFIG_URL || 'http://localhost:3040'
export const DEFAULT_TIMEOUT = 600000
