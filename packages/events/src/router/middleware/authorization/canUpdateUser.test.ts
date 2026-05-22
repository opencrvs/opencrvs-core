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

import { expect, test, vi, type Mock } from 'vitest'
import fc from 'fast-check'
import { TRPCError } from '@trpc/server'
import {
  encodeScope,
  TestUserRole,
  TokenUserType,
  JurisdictionFilter,
  getLocationHierarchy as computeLocationHierarchy,
  UUID,
  V2_DEFAULT_MOCK_LOCATIONS,
  V2_DEFAULT_MOCK_LOCATIONS_MAP,
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP
} from '@opencrvs/commons'
import { getUserById } from '@events/storage/postgres/events/users'
import { getLocationHierarchy } from '@events/service/locations/locations'
import { createTestToken } from '@events/tests/utils'
import { canUpdateUser } from '@events/router/middleware/authorization'

vi.mock('@events/storage/postgres/events/users', () => ({
  getUserById: vi.fn()
}))

vi.mock('@events/service/locations/locations', () => ({
  getLocationHierarchy: vi.fn()
}))

const mockedGetUserById = getUserById as unknown as Mock
const mockedGetLocationHierarchy = getLocationHierarchy as unknown as Mock

const locationContext = {
  locations: V2_DEFAULT_MOCK_LOCATIONS_MAP,
  administrativeAreas: V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP
}

const crvsOffices = V2_DEFAULT_MOCK_LOCATIONS.filter(
  (l) => l.locationType === 'CRVS_OFFICE'
)

const centralProvincialOffice = V2_DEFAULT_MOCK_LOCATIONS.find(
  (l) => l.name === 'Central Provincial Office'
)

if (!centralProvincialOffice) {
  throw new Error('Central Provincial Office not found in mock locations')
}

const requestingUserId = '00000000-0000-4000-8000-000000000000' as UUID
const existingUserId = '11111111-1111-4111-8111-111111111111' as UUID

const requestingUser = {
  id: requestingUserId,
  type: TokenUserType.enum.user,
  primaryOfficeId: centralProvincialOffice.id,
  administrativeAreaId: centralProvincialOffice.administrativeAreaId,
  role: TestUserRole.enum.REGISTRATION_AGENT,
  signature: null
}

function officeAccessible(
  hierarchy: UUID[],
  primaryOfficeId: UUID,
  accessLevel: JurisdictionFilter | undefined,
  requester: { primaryOfficeId: UUID; administrativeAreaId: UUID | null }
): boolean {
  if (accessLevel === 'location') {
    return primaryOfficeId === requester.primaryOfficeId
  }
  if (accessLevel === 'administrativeArea') {
    return (
      requester.administrativeAreaId === null ||
      hierarchy.includes(requester.administrativeAreaId)
    )
  }
  return true
}

test('grants access iff both existing and updated (location, role) satisfy any user.edit scope', async () => {
  const officePairs = fc
    .record({
      existingOffice: fc.constantFrom(...crvsOffices),
      updatedOffice: fc.constantFrom(...crvsOffices)
    })
    .filter(
      ({ existingOffice, updatedOffice }) =>
        existingOffice.id !== updatedOffice.id
    )

  const rolePairs = fc.record({
    existingUserRole: fc.constantFrom(...TestUserRole.options),
    updatedUserRole: fc.constantFrom(...TestUserRole.options)
  })

  const combinations = fc.record({
    offices: officePairs,
    roles: rolePairs,
    accessLevel: fc.option(fc.constantFrom(...JurisdictionFilter.options), {
      nil: undefined
    })
  })

  await fc.assert(
    fc.asyncProperty(combinations, async ({ offices, roles, accessLevel }) => {
      const { existingOffice, updatedOffice } = offices
      const { existingUserRole, updatedUserRole } = roles

      const existingHierarchy = computeLocationHierarchy(
        existingOffice.id,
        locationContext
      )
      const updatedHierarchy = computeLocationHierarchy(
        updatedOffice.id,
        locationContext
      )

      const irrelevantRole = TestUserRole.options.find(
        (role) => role !== existingUserRole && role !== updatedUserRole
      ) as TestUserRole

      // Four role constraint variants: none, existing only, updated only, both
      const scopeRoleCombinations: string[][] = [
        [irrelevantRole],
        [existingUserRole],
        [updatedUserRole],
        [existingUserRole, updatedUserRole]
      ]

      for (const scopeRole of scopeRoleCombinations) {
        vi.clearAllMocks()

        // getLocationHierarchy is called twice inside canUpdateUser: once for each office
        mockedGetUserById.mockResolvedValue({
          officeId: existingOffice.id,
          role: existingUserRole
        })
        mockedGetLocationHierarchy
          .mockResolvedValueOnce(existingHierarchy)
          .mockResolvedValueOnce(updatedHierarchy)

        // Oracle: requester scope must permit access to BOTH the existing and updated state
        const existingOk =
          scopeRole.includes(existingUserRole) &&
          officeAccessible(
            existingHierarchy,
            existingOffice.id,
            accessLevel,
            requestingUser
          )
        const updatedOk =
          scopeRole.includes(updatedUserRole) &&
          officeAccessible(
            updatedHierarchy,
            updatedOffice.id,
            accessLevel,
            requestingUser
          )
        const expectedAllowed = existingOk && updatedOk

        const token = createTestToken({
          userId: requestingUserId,
          scopes: [
            encodeScope({
              type: 'user.edit',
              options: { accessLevel, role: scopeRole }
            })
          ],
          role: TestUserRole.enum.REGISTRATION_AGENT
        })
        const next = vi.fn((a) => a)

        try {
          await canUpdateUser({
            ctx: { token, user: requestingUser },
            input: {
              id: existingUserId,
              primaryOfficeId: updatedOffice.id,
              role: updatedUserRole
            },
            next
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
          expect(expectedAllowed).toBe(true)
        } catch (e) {
          if (e instanceof TRPCError) {
            expect(expectedAllowed).toBe(false)
          } else {
            throw e
          }
        }
      }
    }),
    { numRuns: 100 }
  )
})
