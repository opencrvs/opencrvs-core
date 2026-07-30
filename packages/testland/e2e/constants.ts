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
export const DOMAIN = process.env.DOMAIN || 'farajaland-e2e.opencrvs.dev'
export const SCHEME = process.env.SCHEME || 'https'
export const LOGIN_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3020'
    : SCHEME + '://login.' + DOMAIN

export const AUTH_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4040'
    : SCHEME + '://gateway.' + DOMAIN + '/auth'

export const CLIENT_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : SCHEME + '://register.' + DOMAIN

export const GATEWAY_HOST =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:7070'
    : SCHEME + '://gateway.' + DOMAIN

export const METABASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4444'
    : SCHEME + '://metabase.' + DOMAIN

export const METABASE_EMAIL =
  process.env.NODE_ENV === 'development'
    ? 'user@opencrvs.org'
    : 'user@opencrvs.com'

export const METABASE_PASSWORD = 'm3tabase'

/*
 * This timeout is to ensure that all previous actions have been completed
 * including filling inputs and that the changed values have been reflected
 * also to the Redux state. 500ms is selected as a safe value.
 */
export const SAFE_INPUT_CHANGE_TIMEOUT_MS = 500

export const TEST_USER_PASSWORD = 'test'

export const CREDENTIALS = {
  HOSPITAL_OFFICIAL: 'k.cwalya',
  HOSPITAL_OFFICIAL_OTHER: 'k.bwalya',
  HEALTH_ADMINISTRATOR: 'h.habazoka',
  COMMUNITY_LEADER: 'g.phiri',
  REGISTRATION_OFFICER: 'f.katongo',
  REGISTRATION_OFFICER_PUALULA: 'm.simbaya',
  REGISTRATION_OFFICER_VILLAGE: 'v.katongo',
  REGISTRAR: 'k.mweene',
  REGISTRAR_VILLAGE: 'v.mweene',
  REGISTRAR_PUALULA: 'n.siame',
  REGISTRAR_GENERAL: 'c.lungu',
  REGISTRAR_ISAMBA: 'j.banda',
  NATIONAL_SYSTEM_ADMIN: 'j.campbell',
  LOCAL_SYSTEM_ADMIN: 'e.mayuka',
  PERFORMANCE_MANAGER: 'm.musonda',
  PROVINCIAL_REGISTRAR: 'm.owen',
  EMBASSY_OFFICIAL: 't.mwila'
} as const
