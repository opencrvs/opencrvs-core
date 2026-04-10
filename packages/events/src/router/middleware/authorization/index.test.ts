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

import { encodeScope, TestUserRole } from '@opencrvs/commons'
import { MiddlewareOptions } from '@events/router/middleware/utils'
import { createTestToken } from '@events/tests/utils'
import { TrpcContext } from '@events/context'
import { allowedWithAnyOfScopes } from '.'

describe('allowedWithAnyOfScopes()', () => {
  test('should throw TRPCError with code "FORBIDDEN" if none of the required scopes are present on the token', async () => {
    const middleware = allowedWithAnyOfScopes([
      'notification-api',
      'record.reindex'
    ])

    // missing all of the required scopes
    const mockOpts = {
      ctx: {
        token: createTestToken({
          userId: 'test-user-id',
          scopes: [encodeScope({ type: 'record.declare' })],
          role: TestUserRole.enum.REGISTRATION_AGENT
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
    const middleware = allowedWithAnyOfScopes([
      'notification-api',
      'record.reindex'
    ])

    // has one of the required scopes
    const mockOpts = {
      ctx: {
        token: createTestToken({
          userId: 'test-user-id',
          scopes: [encodeScope({ type: 'record.reindex' })],
          role: TestUserRole.enum.REGISTRATION_AGENT
        })
      },
      next: vi.fn()
    } as unknown as MiddlewareOptions<TrpcContext>

    await middleware(mockOpts)

    expect(mockOpts.next).toHaveBeenCalled()
  })
})
