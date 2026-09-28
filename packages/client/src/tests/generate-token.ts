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
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import * as jwt from 'jsonwebtoken'
import type { TestUserRole, TokenUserType } from '@opencrvs/commons/client'

/*
 * Node-only: signs with `test/cert.key` of the client package.
 * Browser code gets pre-signed tokens from `virtual:test-tokens` instead.
 */

/*
 * Resolved from this module rather than the working directory, so tests and
 * Storybook work wherever they are started from. The test-tokens plugin in
 * vite.config.ts defines `import.meta.url` for its CJS bundle of this file.
 */
export const certKeyPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../test/cert.key'
)

export const TEST_TOKEN_EXP = Math.floor(
  new Date('2100-01-01T00:00:00Z').getTime() / 1000
)

/** Fixed so tokens are deterministic; matches the `Date.now` mock in setupTests. */
const TEST_TOKEN_IAT = 1487076708

export function generateToken({
  scope,
  userType,
  role,
  subject,
  exp = TEST_TOKEN_EXP
}: {
  scope: string[]
  subject?: string
  userType?: TokenUserType
  role?: TestUserRole
  /** Expiry as seconds since the epoch. Pass a past value for an expired token. */
  exp?: number
}) {
  if (subject) {
    return jwt.sign(
      { scope, userType, role, iat: TEST_TOKEN_IAT, exp },
      readFileSync(certKeyPath),
      {
        subject,
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
  }

  return jwt.sign(
    { scope, iat: TEST_TOKEN_IAT, exp },
    readFileSync(certKeyPath),
    {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:gateway-user'
    }
  )
}
