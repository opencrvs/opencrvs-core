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
  createToken,
  verifyToken,
  getStoredUserInformation
} from '@auth/features/authenticate/service'
import { JWT_ISSUER } from '@auth/constants'
import { TokenUserType } from '@opencrvs/commons/authentication'
import { TestUserRole } from '@opencrvs/commons'
import { isLeft } from 'fp-ts/lib/Either'

describe('authenticate service errors', () => {
  describe('verifyToken - token expired', () => {
    it('returns a JWT Error for an expired token', async () => {
      // Scopes are irrelevant: expiry is rejected before the payload is read.
      const expiredToken = await createToken(
        '6821c175dce4d7886d4e8210',
        [],
        ['opencrvs:auth-user'],
        JWT_ISSUER,
        TestUserRole.enum.LOCAL_REGISTRAR,
        TokenUserType.enum.user,
        -60
      )

      const error = verifyToken(expiredToken)
      expect(isLeft(error) && error.left).toMatchSnapshot()
    })
    it('returns an Error for a malformed token', () => {
      const badToken = 'ytfhgfgf'
      const error = verifyToken(badToken)
      expect(isLeft(error) && error.left).toMatchSnapshot()
    })
  })

  describe('getStoredUserInformation - cannot find a user', () => {
    it('returns an Error if a user cannot be found', () => {
      const badNonce = 'ytfhgfjhgf'

      expect(
        getStoredUserInformation(badNonce)
      ).rejects.toThrowErrorMatchingSnapshot()
    })
  })
})
