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
import { TRPCError } from '@trpc/server'
import {
  JurisdictionFilter,
  TestUserRole,
  User,
  encodeScope,
  getDeclarationFields
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { assertUserScopeResult, createTestClient } from '@events/tests/utils'
import { createIndex } from '@events/service/indexing/indexing'
import { getEventIndexName } from '@events/storage/elasticsearch'
import { setupHierarchyWithUsers } from '@events/tests/generators'

test('Check scopes against user.update with non-location payload', async () => {
  await createIndex(
    getEventIndexName('tennis-club-membership_premium'),
    getDeclarationFields(tennisClubMembershipEvent)
  )
  // 1. Setup test fixture with a known set of users, administrative areas and locations.
  const { users, isUnderAdministrativeArea } = await setupHierarchyWithUsers()

  const clientReadingAllUsers = createTestClient(users[0], [
    encodeScope({
      type: 'user.read'
    })
  ])

  const accessLevelOptions = fc.option(
    fc.constantFrom(...JurisdictionFilter.options),
    {
      nil: undefined
    }
  )

  const roleOptions = fc.option(
    fc.constantFrom(
      [TestUserRole.enum.FIELD_AGENT],
      [TestUserRole.enum.FIELD_AGENT, TestUserRole.enum.COMMUNITY_LEADER],
      TestUserRole.options
    ),
    {
      nil: undefined
    }
  )

  // 2. Create option combinations for scopes and users
  const combinations = fc.record({
    userRequesting: fc.constantFrom(...users),
    userTargeted: fc.constantFrom(...users),
    accessLevel: accessLevelOptions,
    role: roleOptions
  })

  // 3. Test combination against random user and assert results
  await fc.assert(
    fc.asyncProperty(
      combinations,
      async ({ userRequesting, userTargeted, ...options }) => {
        const scope = encodeScope({
          type: 'user.edit',
          options: {
            accessLevel: options.accessLevel,
            role: options.role
          }
        })

        const testClient = createTestClient(userRequesting, [scope])

        let result: { success: boolean; user: User }

        try {
          // 1. Perform the action with the given test client.
          const changedUser = await testClient.user.update({
            id: userTargeted.id,
            signature: {
              path: 'string',
              originalFilename: 'string',
              type: 'string'
            }
          })

          result = { success: true, user: changedUser }
        } catch (error) {
          if (error instanceof TRPCError) {
            // 2. If action fails, attempt to fetch the user with the client that has access to all users to verify the failure was due to scope restrictions.
            const userFetchedAsAdmin = (await clientReadingAllUsers.user.get(
              userTargeted.id
            )) as User
            result = { success: false, user: userFetchedAsAdmin }
          } else {
            throw error
          }
        }

        assertUserScopeResult(result, {
          userRequesting,
          userTargeted,
          role: options.role,
          accessLevel: options.accessLevel,
          isUnderAdministrativeArea
        })
      }
    ),
    {
      numRuns: 50
    }
  )
})
