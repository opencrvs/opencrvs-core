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

import { encodeScope, getUUID, TestUserRole, UUID } from '@opencrvs/commons'
import { MiddlewareOptions } from '@events/router/middleware/utils'
import { createTestToken, TEST_SYSTEM_ID } from '@events/tests/utils'
import { TrpcContext } from '@events/context'
import { allowedWithAnyOfScopes, canAccessEventWithScopes } from '.'

describe('allowedWithAnyOfScopes()', () => {
  test('should throw TRPCError with code "FORBIDDEN" if none of the required scopes are present on the token', async () => {
    const middleware = allowedWithAnyOfScopes([
      'record.notify',
      'record.reindex'
    ])

    // missing all of the required scopes
    const mockOpts = {
      ctx: {
        token: createTestToken({
          userId: TEST_SYSTEM_ID,
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
      'record.notify',
      'record.reindex'
    ])

    // has one of the required scopes
    const mockOpts = {
      ctx: {
        token: createTestToken({
          userId: TEST_SYSTEM_ID,
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

describe('canAccessEventWithScopes()', () => {
  test('throws FORBIDDEN when token eventId does not match the requested event', async () => {
    const eventA = getUUID()
    const eventB = getUUID()
    const input = { eventId: eventA }
    const mockOpts = {
      ctx: {
        token: createTestToken({
          eventId: eventB,
          role: TestUserRole.enum.FIELD_AGENT,
          userId: 'test-user-id' as UUID,
          scopes: [encodeScope({ type: 'record.read'})]
        })
      },
      getRawInput: () => input,
      input,
      next: vi.fn()
    } as unknown as MiddlewareOptions<TrpcContext>

    await expect(canAccessEventWithScopes(['record.read'])(mockOpts)).rejects.toMatchObject({
      code: 'FORBIDDEN',
      message: 'Token does not grant access to this event'
    })

    expect(mockOpts.next).not.toHaveBeenCalled()
  })

  test('passes eventId check when token eventId matches the requested event', async () => {
    const eventId = getUUID()
    const input = { eventId }
    // Token and input share the same event ID — the check passes.
    // The middleware then proceeds to getEventById (DB call) which will fail,
    // but the failure will not be the eventId-specific FORBIDDEN.
    const mockOpts = {
      ctx: {
        token: createTestToken({
          eventId,
          role: TestUserRole.enum.FIELD_AGENT,
          userId: 'test-user-id' as UUID,
          scopes: [encodeScope({ type: 'record.read'})]
        })
      },
      getRawInput: () => input,
      input,
      next: vi.fn()
    } as unknown as MiddlewareOptions<TrpcContext>

    await expect(canAccessEventWithScopes(['record.read'])(mockOpts)).rejects.not.toMatchObject({
      message: 'Token does not grant access to this event'
    })
  })
})
