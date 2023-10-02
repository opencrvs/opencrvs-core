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
export const AUTH_HOST = process.env.AUTH_HOST || 'http://localhost:4040'
export const COUNTRY_CONFIG_HOST =
  process.env.COUNTRY_CONFIG_HOST || 'http://localhost:3040'
export const GATEWAY_HOST = process.env.GATEWAY_HOST || 'http://localhost:7070'
export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'

export const SUPER_USER_PASSWORD = process.env.SUPER_USER_PASSWORD ?? 'password'

export const ACTIVATE_USERS = process.env.ACTIVATE_USERS ?? 'false'
