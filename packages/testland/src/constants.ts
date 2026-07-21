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
export const THIRTY_MINUTES_IN_MILLISECONDS = 1000 * 60 * 30

export const DOMAIN = env.DOMAIN
export const GATEWAY_URL = env.GATEWAY_URL
export const LOGIN_URL = env.LOGIN_URL
export const CLIENT_APP_URL = env.CLIENT_APP_URL

export const COUNTRY_CONFIG_HOST = env.COUNTRY_CONFIG_HOST
export const COUNTRY_CONFIG_PORT = env.COUNTRY_CONFIG_PORT
export const AUTH_URL = env.AUTH_URL
export const COUNTRY_CONFIG_URL = env.COUNTRY_CONFIG_URL

export const SENTRY_DSN = env.SENTRY_DSN

export const PRODUCTION = env.isProd
export const ESIGNET_REDIRECT_URL = env.ESIGNET_REDIRECT_URL
export const OPENID_PROVIDER_CLIENT_ID = env.OPENID_PROVIDER_CLIENT_ID
export const OPENID_PROVIDER_CLAIMS = env.OPENID_PROVIDER_CLAIMS
export const MOSIP_API_USERINFO_URL = env.MOSIP_API_USERINFO_URL
export const ANALYTICS_DATABASE_URL = env.ANALYTICS_DATABASE_URL
export const MOSIP_INTEROP_URL = env.MOSIP_INTEROP_URL
export const SYSTEM_CLIENT_ID = env.SYSTEM_CLIENT_ID
export const SYSTEM_CLIENT_SECRET = env.SYSTEM_CLIENT_SECRET
export const NO_MOSIP = env.NO_MOSIP
export const REFERENCE_DATA_DATABASE_URL = env.REFERENCE_DATA_DATABASE_URL
