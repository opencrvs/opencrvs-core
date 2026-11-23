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
import {
  certKeyPath,
  TEST_TOKEN_AUDIENCE,
  TEST_TOKEN_ISSUER
} from './generate-token'
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
          issuer: TEST_TOKEN_ISSUER,
          audience: TEST_TOKEN_AUDIENCE
        }
      )

      expect(payload).toMatchObject({ scope, sub: subject, userType, role })
    }
  )

  /*
   * Spelled out rather than read from `testUserTokenClaims`, so a wrong
   * subject, role or scope in the claims fails here.
   */
  it('signs the expected user, role and key scopes', () => {
    expect(jwt.decode(testUserTokens.legacyDefault)).toMatchObject({
      sub: 'b77b78af-a259-4bc1-85d5-b1e8c1382273',
      role: 'FIELD_AGENT',
      userType: 'user',
      scope: []
    })
    expect(jwt.decode(testUserTokens.fieldAgent)).toMatchObject({
      sub: '8f8b431b-ef47-4068-b678-ef2dd93e9208',
      role: 'FIELD_AGENT',
      userType: 'user',
      scope: expect.arrayContaining([
        'type=record.create',
        'type=record.declare'
      ])
    })
    expect(jwt.decode(testUserTokens.fieldAgent)).not.toMatchObject({
      scope: expect.arrayContaining(['type=record.register'])
    })
    expect(jwt.decode(testUserTokens.localRegistrar)).toMatchObject({
      sub: 'aa13a268-ae48-4a30-9450-554aebaab203',
      role: 'LOCAL_REGISTRAR',
      userType: 'user',
      scope: expect.arrayContaining(['type=record.register'])
    })
  })
})
