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
import { requiresScopes } from '.'
import { MiddlewareOptions } from '@events/router/middleware/utils'
import { createTestToken } from '@events/tests/utils'

describe.only('requiresScopes()', () => {
  test('should throw TRPCError with code "FORBIDDEN" if any of the required scopes are missing', async () => {
    const middleware = requiresScopes([
      SCOPES.RECORD_REGISTER,
      SCOPES.RECORD_CONFIRM_REGISTRATION
    ])

    // missing one of the required scopes
    const mockOpts = {
      ctx: {
        token: createTestToken('test-user-id', [SCOPES.RECORD_REGISTER])
      },
      next: vi.fn()
    } as unknown as MiddlewareOptions

    await expect(middleware(mockOpts)).rejects.toMatchObject({
      code: 'FORBIDDEN'
    })

    expect(mockOpts.next).not.toHaveBeenCalled()
  })

  test('should call next if all required scopes are present', async () => {
    const middleware = requiresScopes([
      SCOPES.RECORD_REGISTER,
      SCOPES.RECORD_CONFIRM_REGISTRATION
    ])

    // has all the required scopes
    const mockOpts = {
      ctx: {
        token: createTestToken('test-user-id', [
          SCOPES.RECORD_REGISTER,
          SCOPES.RECORD_CONFIRM_REGISTRATION
        ])
      },
      next: vi.fn()
    } as unknown as MiddlewareOptions

    await middleware(mockOpts)

    expect(mockOpts.next).toHaveBeenCalled()
  })
})
