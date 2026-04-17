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

import { afterEach, describe, expect, test, vi } from 'vitest'
import { TRPCError } from '@trpc/server'
import { hasScope } from '@opencrvs/commons'
import { getUserById } from '@events/storage/postgres/events/users'
import { enforceOfficeUpdatePermission } from './index'

vi.mock('@events/storage/postgres/events/users', () => ({
  getUserById: vi.fn()
}))

vi.mock('@opencrvs/commons', async () => {
  const actual =
    await vi.importActual<typeof import('@opencrvs/commons')>(
      '@opencrvs/commons'
    )
  return {
    ...actual,
    hasScope: vi.fn()
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('enforceOfficeUpdatePermission', () => {
  const mockedGetUserById = getUserById as unknown as vi.Mock
  const mockedHasScope = hasScope as unknown as vi.Mock
  const existingUserId = '11111111-1111-4111-8111-111111111111'
  const existingOfficeId = '22222222-2222-4222-8222-222222222222'
  const otherOfficeId = '33333333-3333-4333-8333-333333333333'

  test('allows user update when primaryOfficeId is omitted', async () => {
    mockedGetUserById.mockResolvedValue({ officeId: existingOfficeId })
    mockedHasScope.mockReturnValue(false)

    const next = vi.fn(async ({ input, ctx }) => ({ input, ctx }))

    const result = await enforceOfficeUpdatePermission({
      ctx: { token: 'Bearer token' },
      input: { id: existingUserId },
      next
    } as any)

    expect(next).toHaveBeenCalled()
    expect(result.input.primaryOfficeId).toBe(existingOfficeId)
  })

  test('forbids office change without config.update-all scope', async () => {
    mockedGetUserById.mockResolvedValue({ officeId: existingOfficeId })
    mockedHasScope.mockReturnValue(false)

    const next = vi.fn(async ({ input, ctx }) => ({ input, ctx }))

    await expect(
      enforceOfficeUpdatePermission({
        ctx: { token: 'Bearer token' },
        input: {
          id: existingUserId,
          primaryOfficeId: otherOfficeId
        },
        next
      } as any)
    ).rejects.toBeInstanceOf(TRPCError)
    expect(next).not.toHaveBeenCalled()
  })
})
