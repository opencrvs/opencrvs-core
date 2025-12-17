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
import fc from 'fast-check'
import { createPrng, SCOPES, TestUserRole, UserFilter } from '@opencrvs/commons'
import { MiddlewareOptions } from '@events/router/middleware/utils'
import { createTestToken } from '@events/tests/utils'
import { TrpcContext } from '@events/context'
import {
  generateTestLocations,
  generateTestAdministrativeAreas,
  generateTestUsersForLocations
} from '../../../tests/generators'
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
          role: TestUserRole.enum.REGISTRATION_AGENT
        })
      },
      next: vi.fn()
    } as unknown as MiddlewareOptions<TrpcContext>

    await middleware(mockOpts)

    expect(mockOpts.next).toHaveBeenCalled()
  })
})

describe('canAccessEventWithScopes', () => {
  const rng = createPrng(12343244)
  const administrativeAreas = generateTestAdministrativeAreas()
  const locations = generateTestLocations(administrativeAreas, rng)
  const users = generateTestUsersForLocations(locations, rng)

  const userIds = fc.constantFrom(...users.map((u) => u.id))
  const locationIds = fc.constantFrom(
    ...locations.map((location) => location.id)
  )

  const administrativeAreaIds = fc.option(
    fc.constantFrom(...administrativeAreas.map((area) => area.id)),
    { nil: undefined }
  )

  const userOptions = fc.option(fc.constant(UserFilter.enum.user), {
    nil: undefined
  })

  const testUsers = fc.constantFrom(...users)

  canAccessEventWithScopes()

  const scopeCombinations = fc.record({
    eventId: eventIds,
    user: testUsers,
    declaredIn: jurisdictionOptions,
    declaredBy: userOptions
  })
})
