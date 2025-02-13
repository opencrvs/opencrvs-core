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

import { SCOPES } from '@opencrvs/commons'
import { requiresAnyOfScopes } from '.'
import { MiddlewareOptions } from '@events/router/middleware/utils'
import { createTestToken } from '@events/tests/utils'

describe('requiresScopes()', () => {
  test('should throw TRPCError with code "FORBIDDEN" if none of the required scopes are present on the token', async () => {
    const middleware = requiresAnyOfScopes([
      SCOPES.RECORD_REGISTER,
      SCOPES.RECORD_CONFIRM_REGISTRATION
    ])

    // missing one of the required scopes
    const mockOpts = {
      ctx: {
        token: createTestToken('test-user-id', [SCOPES.RECORD_DECLARE_BIRTH])
      },
      next: vi.fn()
    } as unknown as MiddlewareOptions

    await expect(middleware(mockOpts)).rejects.toMatchObject({
      code: 'FORBIDDEN'
    })

    expect(mockOpts.next).not.toHaveBeenCalled()
  })

  test('should call next if any of the required scopes are present on the token', async () => {
    const middleware = requiresAnyOfScopes([
      SCOPES.RECORD_REGISTER,
      SCOPES.RECORD_CONFIRM_REGISTRATION
    ])

    // has one of the required scopes
    const mockOpts = {
      ctx: {
        token: createTestToken('test-user-id', [
          SCOPES.RECORD_CONFIRM_REGISTRATION
        ])
      },
      next: vi.fn()
    } as unknown as MiddlewareOptions

    await middleware(mockOpts)

    expect(mockOpts.next).toHaveBeenCalled()
  })
})
