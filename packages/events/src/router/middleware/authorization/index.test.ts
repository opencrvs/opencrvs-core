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

import { SCOPES, TestUserRole } from '@opencrvs/commons'
import { MiddlewareOptions } from '@events/router/middleware/utils'
import { createTestToken } from '@events/tests/utils'
import { TrpcContext } from '@events/context'
import { requiresAnyOfScopes } from '.'

describe('requiresScopes()', () => {
  test('should throw TRPCError with code "FORBIDDEN" if none of the required scopes are present on the token', async () => {
    const middleware = requiresAnyOfScopes([
      SCOPES.RECORD_REGISTER,
      SCOPES.RECORD_CONFIRM_REGISTRATION
    ])

    // missing all of the required scopes
    const mockOpts = {
      ctx: {
        token: createTestToken({
          userId: 'test-user-id',
          scopes: ['record.declare[event=birth|death|tennis-club-membership]'],
          role: TestUserRole.Enum.REGISTRATION_AGENT
        })
      },
      next: vi.fn()
    } as unknown as MiddlewareOptions<TrpcContext>

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
        token: createTestToken({
          userId: 'test-user-id',
          scopes: [SCOPES.RECORD_CONFIRM_REGISTRATION],
          role: TestUserRole.Enum.REGISTRATION_AGENT
        })
      },
      next: vi.fn()
    } as unknown as MiddlewareOptions<TrpcContext>

    await middleware(mockOpts)

    expect(mockOpts.next).toHaveBeenCalled()
  })
})
