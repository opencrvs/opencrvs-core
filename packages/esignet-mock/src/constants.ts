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
import { cleanEnv, port, str, url } from 'envalid'
import { join } from 'node:path'

export const env = cleanEnv(process.env, {
  PORT: port({ default: 20260 }),
  HOST: str({ default: '0.0.0.0', devDefault: 'localhost' }),
  OIDP_CLIENT_PRIVATE_KEY_PATH: str({
    devDefault: join(__dirname, './dev-secrets/jwk.txt')
  })
})
