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
import { readFileSync } from 'fs'

export const HOST = process.env.HOST || 'localhost'
export const PORT = process.env.PORT || 2020

/*
  For these locales sms content will not be sent as unicoded payload
  In future based on our experience on different countries we can add more locals here
*/
export const NON_UNICODED_LANGUAGES = ['en']

export const SMS_PROVIDER = process.env.SMS_PROVIDER || 'infobip'

export const CLICKATELL_USER = process.env.CLICKATELL_USER_PATH
  ? readFileSync(process.env.CLICKATELL_USER_PATH).toString()
  : ''
export const CLICKATELL_PASSWORD = process.env.CLICKATELL_PASSWORD_PATH
  ? readFileSync(process.env.CLICKATELL_PASSWORD_PATH).toString()
  : ''
export const CLICKATELL_API_ID = process.env.CLICKATELL_API_ID_PATH
  ? readFileSync(process.env.CLICKATELL_API_ID_PATH).toString()
  : ''

export const INFOBIP_GATEWAY_ENDPOINT = process.env
  .INFOBIP_GATEWAY_ENDPOINT_PATH
  ? readFileSync(process.env.INFOBIP_GATEWAY_ENDPOINT_PATH).toString()
  : ''

export const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY_PATH
  ? readFileSync(process.env.INFOBIP_API_KEY_PATH).toString()
  : ''

export const INFOBIP_SENDER_ID = process.env.INFOBIP_SENDER_ID
  ? readFileSync(process.env.INFOBIP_SENDER_ID).toString()
  : ''

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
export const COUNTRY_CONFIG_URL =
  process.env.COUNTRY_CONFIG_URL || 'http://localhost:3040'
export const DEFAULT_TIMEOUT = 600000
