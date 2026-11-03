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
import { createPublicKey } from 'crypto'
import { verifyCoreRequest } from '@opencrvs/commons/request-signing'
import { coreSigningKey } from '@events/request-signing'

/** Verifies a request intercepted by msw the way country config would. */
export async function verifySignedByCore(request: Request) {
  const url = new URL(request.url)
  return verifyCoreRequest(
    {
      method: request.method,
      path: url.pathname,
      query: url.search,
      rawBody: Buffer.from(await request.clone().arrayBuffer()),
      headers: Object.fromEntries(request.headers)
    },
    async (keyid) =>
      keyid === coreSigningKey.keyid
        ? createPublicKey(coreSigningKey.privateKey)
        : undefined
  )
}
