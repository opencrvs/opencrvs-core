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
jest.mock('@auth/features/refresh/family', () => ({
  createFamily: jest.fn().mockResolvedValue({ familyId: 'fam-1', jti: 'jti-1' })
}))

import {
  createRefreshToken,
  signRefreshToken,
  verifyRefreshToken
} from '@auth/features/authenticate/service'
import { TokenUserType } from '@opencrvs/commons'

test('createRefreshToken seeds a family and embeds familyId + jti', async () => {
  const token = await createRefreshToken('user-1', TokenUserType.enum.user)
  const decoded = verifyRefreshToken(token)
  expect(decoded._tag).toBe('Right')
  if (decoded._tag === 'Right') {
    expect(decoded.right.sub).toBe('user-1')
    expect(decoded.right.familyId).toBe('fam-1')
    expect(decoded.right.jti).toBe('jti-1')
  }
})

test('signRefreshToken round-trips familyId + jti through verifyRefreshToken', async () => {
  const token = await signRefreshToken(
    'user-2',
    TokenUserType.enum.user,
    'fam-X',
    'jti-X'
  )
  const decoded = verifyRefreshToken(token)
  expect(decoded._tag).toBe('Right')
  if (decoded._tag === 'Right') {
    expect(decoded.right.familyId).toBe('fam-X')
    expect(decoded.right.jti).toBe('jti-X')
  }
})
