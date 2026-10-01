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

export const DOMAIN = process.env.DOMAIN || 'opencrvs.localhost'
export const SCHEME = process.env.SCHEME || 'http'

export const LOGIN_URL = `${SCHEME}://login.${DOMAIN}`
export const GATEWAY_URL = `${SCHEME}://register.${DOMAIN}/api`

/*
 * Defaults match a user from src/data-seeding/employees/source/default-employees.csv
 */
export const TEST_USERNAME = process.env.E2E_USERNAME || 'c.lungu'
export const TEST_PASSWORD = process.env.E2E_PASSWORD || 'test'
