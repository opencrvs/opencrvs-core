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
export const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4040'
export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030/'
export const APPLICATION_CONFIG_URL =
  process.env.APPLICATION_CONFIG_URL || 'http://localhost:2021/'
export const DOCUMENTS_URL =
  process.env.DOCUMENTS_URL || 'http://localhost:9050'
export const COUNTRY_CONFIG_URL =
  process.env.COUNTRY_CONFIG_URL || 'http://localhost:3040'
export const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:7070'
export const GATEWAY_GQL_HOST =
  process.env.GATEWAY_GQL_HOST || 'http://localhost:7070/graphql'
export const HEARTH_URL = process.env.HEARTH_URL || 'http://localhost:3447/fhir'
export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'

export const SUPER_USER_PASSWORD = process.env.SUPER_USER_PASSWORD ?? 'password'
