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
import {
  CoreSigningKey,
  loadCoreSigningKeyFile
} from '@opencrvs/commons/request-signing'
import { env } from '@events/environment'

let coreSigningKey: CoreSigningKey | undefined

/**
 * The key events signs its requests to country config with. Read on first
 * use, so importing the router (e.g. to generate the OpenAPI document) needs
 * no key; `main` reads it at startup so a missing key still stops the service.
 */
export function getCoreSigningKey() {
  coreSigningKey ??= loadCoreSigningKeyFile(env.CORE_REQUEST_SIGNING_KEY_PATH)
  return coreSigningKey
}
