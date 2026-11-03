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
import { loadCoreSigningKeyFile } from '@opencrvs/commons/request-signing'
import { env } from '@events/environment'

/** The key events signs its requests to country config with. */
export const coreSigningKey = loadCoreSigningKeyFile(
  env.CORE_REQUEST_SIGNING_KEY_PATH
)
