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

/*
 * Same as routing.mode of the Helm charts. In "subdomain" mode, login and the client have their own
 * names: login.<DOMAIN> and register.<DOMAIN>. In "path" mode both are on <DOMAIN>, login at /login.
 */
const ROUTING_MODE = process.env.ROUTING_MODE === 'path' ? 'path' : 'subdomain'

const LOGIN_ORIGIN =
  ROUTING_MODE === 'path'
    ? SCHEME + '://' + DOMAIN
    : SCHEME + '://login.' + DOMAIN
const CLIENT_ORIGIN =
  ROUTING_MODE === 'path'
    ? SCHEME + '://' + DOMAIN
    : SCHEME + '://register.' + DOMAIN
const LOGIN_PATH = ROUTING_MODE === 'path' ? '/login' : ''

export const LOGIN_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3020'
    : LOGIN_ORIGIN + LOGIN_PATH

export const AUTH_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4040'
    : LOGIN_ORIGIN + '/api/auth'

export const CLIENT_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : CLIENT_ORIGIN

export const GATEWAY_HOST =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:7070'
    : CLIENT_ORIGIN + '/api'

/*
 * Which app a page shows. The origin tells login and client apart in "subdomain" mode, but in "path"
 * mode they share it, so the path of login decides.
 */
export const isLoginUrl = (url: URL) =>
  url.origin === new URL(LOGIN_URL).origin &&
  (ROUTING_MODE === 'subdomain' ||
    url.pathname === LOGIN_PATH ||
    url.pathname.startsWith(LOGIN_PATH + '/'))

export const isClientUrl = (url: URL) =>
  url.origin === new URL(CLIENT_URL).origin && !isLoginUrl(url)

export const METABASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4444'
    : SCHEME + '://metabase.' + DOMAIN

export const METABASE_EMAIL =
  process.env.OPENCRVS_METABASE_ADMIN_EMAIL || 'user@opencrvs.org'

export const METABASE_PASSWORD =
  process.env.OPENCRVS_METABASE_ADMIN_PASSWORD || 'm3tabase'

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
  EMBASSY_OFFICIAL: 't.mwila',
  FIELD_AGENT: 'a.nala'
} as const
