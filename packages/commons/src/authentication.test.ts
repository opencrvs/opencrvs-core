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

import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import {
  getUserId,
  getUserTypeFromToken,
  TokenWithBearer
} from './authentication'

function withBearer(token: string): TokenWithBearer {
  return `Bearer ${token}`
}

const ERROR = 'ERROR'

function signToken(params: { sub: string; userType: string }) {
  return jwt.sign(params, readFileSync('./test/cert.key'), {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:workflow-user'
  })
}

const cases = [
  [
    'with valid payload',
    {
      token: withBearer(
        signToken({
          sub: 'foo',
          userType: 'system'
        })
      ),
      expected: {
        userId: 'foo',
        userType: 'system'
      }
    }
  ],
  [
    'With invalid payload',
    {
      token: withBearer(
        signToken({
          sub: 12313 as any,
          userType: 'invalidType'
        })
      ),
      expected: {
        userId: ERROR,
        userType: ERROR
      }
    }
  ],
  [
    'Without Bearer',
    {
      token: signToken({
        sub: '12312123',
        userType: 'system'
      }),
      expected: {
        userId: ERROR,
        userType: ERROR
      }
    }
  ],
  [
    'With bad token',
    {
      token: `Bearer iejasje`,
      expected: {
        userId: ERROR,
        userType: ERROR
      }
    }
  ]
] as const

describe('Token parser helpers ', () => {
  it.each(cases)('getUserId %s', (_, { token, expected }) => {
    if (expected.userId === ERROR) {
      expect(() =>
        getUserId(token as TokenWithBearer)
      ).toThrowErrorMatchingSnapshot()
    } else {
      const parsed = getUserId(token as TokenWithBearer)
      expect(parsed).toBeDefined()
      expect(parsed).toEqual(expected.userId)
    }
  })

  it.each(cases)('getUserType %s', (_, { token, expected }) => {
    if (expected.userType === ERROR) {
      expect(() =>
        getUserTypeFromToken(token as TokenWithBearer)
      ).toThrowErrorMatchingSnapshot()
    } else {
      const parsed = getUserTypeFromToken(token as TokenWithBearer)
      expect(parsed).toBeDefined()
      expect(parsed).toEqual(expected.userType)
    }
  })
})
