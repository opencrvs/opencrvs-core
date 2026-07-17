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
import { bool, cleanEnv, port, str, url } from 'envalid'

export const env = cleanEnv(process.env, {
  DOMAIN: str({ devDefault: '*' }),
  GATEWAY_URL: url({ devDefault: 'http://localhost:7070' }),
  LOGIN_URL: url({ devDefault: 'http://localhost:3020/' }),
  CLIENT_APP_URL: url({ devDefault: 'http://localhost:3000/' }),
  COUNTRY_CONFIG_HOST: str({ default: '0.0.0.0' }),
  COUNTRY_CONFIG_PORT: port({ default: 3040 }),
  AUTH_URL: url({ devDefault: 'http://localhost:4040' }),
  COUNTRY_CONFIG_URL: url({ devDefault: 'http://localhost:3040' }),
  SENTRY_DSN: str({ default: undefined }),
  ESIGNET_REDIRECT_URL: url({ devDefault: 'http://localhost:20260/authorize' }),
  OPENID_PROVIDER_CLIENT_ID: str({ devDefault: 'mock-client_id' }),
  OPENID_PROVIDER_CLAIMS: str({
    devDefault: 'name,family_name,given_name,middle_name,birthdate,address'
  }),
  MOSIP_API_USERINFO_URL: url({
    devDefault: 'http://localhost:2024/esignet/get-oidp-user-info'
  }),
  ANALYTICS_DATABASE_URL: url({
    default: undefined,
    devDefault:
      'postgres://events_analytics:analytics_password@localhost:5432/events',
    desc: 'The database URL for reads and writes to `analytics.events`. See `/infrastructure/postgres/setup-analytics.sh` for how the default database is set up for your country.'
  }),
  MOSIP_INTEROP_URL: url({
    default: 'http://mosip-api:2024',
    devDefault: 'http://localhost:2024',
    desc: 'URL for MOSIP interoperability API'
  }),
  FORWARD_ACTIONS_TO: str({
    default: '',
    devDefault: '',
    desc: 'Comma separated list of URLs to forward action events to'
  }),
  SYSTEM_CLIENT_ID: str({
    default: undefined,
    devDefault: undefined,
    desc: 'Client ID for system-to-system authentication on /api/ proxy endpoints'
  }),
  SYSTEM_CLIENT_SECRET: str({
    default: undefined,
    devDefault: undefined,
    desc: 'Client secret for system-to-system authentication on /api/ proxy endpoints'
  }),
  VERIFIABLE_CREDENTIALS_SDJWT_ISSUE_URL: url({
    default: 'http://countryconfig:3040/_demo-issuer/openid4vc/sdjwt/issue',
    devDefault: 'http://localhost:3040/_demo-issuer/openid4vc/sdjwt/issue',
    desc: 'URL for requesting SD-JWT credential offers for verifiable credentials issuance'
  }),
  VERIFIABLE_CREDENTIALS_RAW_JWT_SIGN_URL: url({
    default: 'http://countryconfig:3040/_demo-issuer/raw/jwt/sign',
    devDefault: 'http://localhost:3040/_demo-issuer/raw/jwt/sign',
    desc: 'URL for signing raw JWTs for verifiable credentials issuance'
  }),
  NO_MOSIP: bool({
    devDefault: true,
    default: false,
    desc: 'Used in local development to disable MOSIP registration dependency'
  }),
  REFERENCE_DATA_DATABASE_URL: url({
    devDefault:
      'postgres://events_reference_data:reference_data_password@localhost:5432/events',
    desc: 'The database URL for reads and writes to `reference_data.icd10`. See `/infrastructure/postgres/setup-reference-data.sh` for how the default database is set up for your country.'
  })
})
