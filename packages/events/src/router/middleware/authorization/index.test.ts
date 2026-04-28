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

import { SCOPES, TestUserRole, UUID } from '@opencrvs/commons'
import { MiddlewareOptions } from '@events/router/middleware/utils'
import { createTestToken } from '@events/tests/utils'
import { TrpcContext } from '@events/context'
import { requiresAnyOfScopes, userCanReadEvent } from '.'

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

describe('userCanReadEvent()', () => {
  test('throws FORBIDDEN when token eventId does not match the requested event', async () => {
    const mockOpts = {
      ctx: {
        token: createTestToken({
          eventId: 'event-a',
          role: TestUserRole.Enum.FIELD_AGENT,
          userId: 'test-user-id',
          scopes: [SCOPES.RECORD_READ]
        })
      },
      input: 'event-b' as UUID,
      next: vi.fn()
    } as unknown as MiddlewareOptions<TrpcContext>

    await expect(userCanReadEvent(mockOpts)).rejects.toMatchObject({
      code: 'FORBIDDEN',
      message: 'Token does not grant access to this event'
    })

    expect(mockOpts.next).not.toHaveBeenCalled()
  })

  test('passes eventId check when token eventId matches the requested event', async () => {
    // Token and input share the same event ID — the check passes.
    // The middleware then proceeds to getEventById (DB call) which will fail,
    // but the failure will not be the eventId-specific FORBIDDEN.
    const mockOpts = {
      ctx: {
        token: createTestToken({
          eventId: 'some-event-id',
          role: TestUserRole.Enum.FIELD_AGENT,
          userId: 'test-user-id',
          scopes: [SCOPES.RECORD_READ]
        })
      },
      input: 'some-event-id' as UUID,
      next: vi.fn()
    } as unknown as MiddlewareOptions<TrpcContext>

    await expect(userCanReadEvent(mockOpts)).rejects.not.toMatchObject({
      message: 'Token does not grant access to this event'
    })
  })
})
