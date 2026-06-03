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
import { DocumentPath } from '../documents'
import { UUID } from '../uuid'
import { UserSummary } from './User'

const baseUser = {
  id: 'aa13a268-ae48-4a30-9450-554aebaab203' as UUID,
  name: { firstname: 'Test', surname: 'User' },
  role: 'LOCAL_REGISTRAR',
  primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
  administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
  type: 'user' as const
}

describe('UserSummary', () => {
  test('preserves signature when present', () => {
    const result = UserSummary.parse({
      ...baseUser,
      signature: 'users/abc/signature.png' as DocumentPath
    })
    expect(result.signature).toBe('users/abc/signature.png')
  })

  test('allows signature to be null', () => {
    const result = UserSummary.parse({ ...baseUser, signature: null })
    expect(result.signature).toBeNull()
  })

  test('allows signature to be absent', () => {
    expect(() => UserSummary.parse(baseUser)).not.toThrow()
  })
})
