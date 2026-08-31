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
import { bool, cleanEnv, makeValidator, port, str, url } from 'envalid'
import { z } from 'zod'

/**
 * A UUID, or an empty string when the variable is left unconfigured. Used for
 * seeded integration credentials: events types the client id it accepts as a
 * UUID, so a malformed seed is rejected there with a 400 — 30 seconds later,
 * buried inside the startup retry loop. Failing at boot instead names the
 * offending variable.
 *
 * `z.uuid()` rather than a local pattern so this is exactly as strict as the
 * check it front-runs; a hand-rolled regex accepts version and variant nibbles
 * that events rejects, which is precisely the case worth catching.
 */
const uuidOrEmpty = makeValidator<string>((value) =>
  value === '' ? value : z.uuid().parse(value)
)

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
  EVENTS_URL: url({ devDefault: 'http://localhost:5555/' }),
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
  MOSIP_INTEGRATION_CLIENT_ID: uuidOrEmpty({
    default: '',
    desc: "OpenCRVS system client ID to seed for the MOSIP integration on startup. Must be a UUID and match the mosip-api's OPENCRVS_CLIENT_ID. Leave empty to have events generate credentials instead (NSA reveals them via the Integrations page)."
  }),
  MOSIP_INTEGRATION_CLIENT_SECRET: str({
    default: '',
    desc: "OpenCRVS system client secret to seed for the MOSIP integration on startup. Must match the mosip-api's OPENCRVS_CLIENT_SECRET. Leave empty to have events generate the secret instead."
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
  REFERENCE_DATA_DATABASE_URL: url({
    devDefault:
      'postgres://events_reference_data:reference_data_password@localhost:5432/events',
    desc: 'The database URL for reads and writes to `reference_data.icd10`. See `/infrastructure/postgres/setup-reference-data.sh` for how the default database is set up for your country.'
  }),
  TELEMETRY_ENABLED: bool({
    // Telemetry is enabled for deployed Testland; local development stays off.
    devDefault: false,
    default: true,
    desc: 'When true, usage telemetry received from the events service is forwarded to the OpenCRVS status service.'
  }),
  COUNTRY_CODE: str({
    default: 'FAR',
    desc: 'ISO-style country code of this instance, reported with telemetry.'
  }),
  ENVIRONMENT_NAME: str({
    default: 'development',
    desc: 'Environment name (e.g. "production", "staging") reported as the telemetry environment.'
  }),
  ORGANISATION: str({
    default: 'OpenCRVS',
    desc: 'Organisation running this instance, reported with telemetry. Empty by default.'
  })
})
