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

import { createPublicKey } from 'node:crypto'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import testUserTokens from 'virtual:test-tokens'
import { certKeyPath } from './generate-token'
import { testUserTokenClaims } from './test-users'

const publicKey = createPublicKey(readFileSync(certKeyPath))

describe('virtual:test-tokens', () => {
  it('has a token for every test user', () => {
    expect(Object.keys(testUserTokens).sort()).toEqual(
      Object.keys(testUserTokenClaims).sort()
    )
  })

  it.each(Object.entries(testUserTokenClaims))(
    '%s token is signed and carries its claims',
    (key, { scope, subject, userType, role }) => {
      const payload = jwt.verify(
        testUserTokens[key as keyof typeof testUserTokens],
        publicKey,
        {
          algorithms: ['RS256'],
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )

      expect(payload).toMatchObject({ scope, sub: subject, userType, role })
    }
  )
})
