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
import { vi } from 'vitest'
import { createTestCoreKey } from '@opencrvs/toolkit/request-signing'

export const coreKey = createTestCoreKey()

/** Serves the test key as auth's key list. Call before `createServer`. */
export function publishCoreKey() {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(coreKey.jwks))
  )
}
