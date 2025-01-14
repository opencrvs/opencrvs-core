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
import { bool, cleanEnv, str, url } from 'envalid'

export const env = cleanEnv(process.env, {
  AUTH_HOST: url({ devDefault: 'http://localhost:4040' }),
  COUNTRY_CONFIG_HOST: url({ devDefault: 'http://localhost:3040' }),
  GATEWAY_HOST: url({ devDefault: 'http://localhost:7070' }),
  SUPER_USER_PASSWORD: str({ devDefault: 'password' }),
  ACTIVATE_USERS: bool({ devDefault: true })
})
