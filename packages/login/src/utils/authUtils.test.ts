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
import { getTokenPayload } from '@login/utils/authUtils'

const performanceJWT =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE1NDE1NzY5NjUsImV4cCI6MTU3MzExMjk2NSwiYXVkIjoiIiwic3ViIjoiMSIsInNjb3BlIjoiWydwZXJmb3JtYW5jZSddIn0.huK3iFFi01xkwHvQZQAOnScrz0rJ50EsxpZA3a1Ynao'

describe('authUtils', () => {
  describe('getTokenPayload. Returns the correct payload from a token', () => {
    it('should return null if token not passed', () => {
      expect(getTokenPayload('')).toEqual(null)
    })

    it('should return null if error occurs', () => {
      expect(getTokenPayload('Invalid Token')).toEqual(null)
    })

    it('should return the right payload', () => {
      const response = {
        iss: '',
        iat: 1541576965,
        exp: 1573112965,
        aud: '',
        sub: '1',
        scope: "['performance']"
      }
      expect(getTokenPayload(performanceJWT)).toEqual(response)
    })
  })
})
