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
  ActionTypes,
  EventDocument,
  JurisdictionFilter,
  TENNIS_CLUB_MEMBERSHIP,
  UserFilter,
  encodeScope,
  getDeclarationFields,
  getUUID
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  assertScopeResult,
  createTestClient,
  setupScopeTestFixture
} from '@events/tests/utils'
import { createIndex } from '@events/service/indexing/indexing'
import { getEventIndexName } from '@events/storage/elasticsearch'

test(
  'Check scopes against event.actions.unassign',
  async () => {
    await createIndex(
      getEventIndexName('tennis-club-membership_premium'),
      getDeclarationFields(tennisClubMembershipEvent)
    )
    // 1. Setup test fixture with a known set of users, administrative areas, and events.
    const { users, isUnderAdministrativeArea, eventIds } =
      await setupScopeTestFixture(
        1243453343,
        fc.constantFrom(
          [ActionTypes.enum.DECLARE],
          [ActionTypes.enum.DECLARE, ActionTypes.enum.REGISTER]
        )
      )

    const clientReadingAllEvents = createTestClient(users[0], [
      encodeScope({
        type: 'record.read'
      })
    ])

    const jurisdictionOptions = fc.option(
      fc.constantFrom(...JurisdictionFilter.options),
      {
        nil: undefined
      }
    )

    const userOptions = fc.option(fc.constant(UserFilter.enum.user), {
      nil: undefined
    })

    // 2. Create option combinations for scopes and users
    const combinations = fc.record({
      user: fc.constantFrom(...users),
      event: fc.option(
        fc.constantFrom<string[]>(
          [TENNIS_CLUB_MEMBERSHIP],
          [TENNIS_CLUB_MEMBERSHIP, 'tennis-club-membership_premium'],
          ['tennis-club-membership_premium']
        ),
        { nil: undefined }
      ),
      placeOfEvent: jurisdictionOptions,
      declaredBy: userOptions,
      declaredIn: jurisdictionOptions,
      registeredBy: userOptions,
      registeredIn: jurisdictionOptions
    })

    // 3. Test combination against random event and assert results
    await fc.assert(
      fc.asyncProperty(combinations, async ({ user, ...options }) => {
        const scope = encodeScope({
          type: 'record.unassign-others',
          options
        })

        const randomIndex = Math.floor(Math.random() * eventIds.length)
        const [eventId] = eventIds.splice(randomIndex, 1)

        const testClient = createTestClient(user, [scope])

        // 1. Fetch the event before performing the action. Doing it after unassign will alter the result.
        const eventBeforeUnassign = await clientReadingAllEvents.event.get({
          eventId
        })

        let result: { success: boolean; event: EventDocument }
        try {
          // 2. Perform the action with the given test client.
          await testClient.event.actions.assignment.unassign({
            eventId,
            transactionId: getUUID(),
            declaration: {},
            assignedTo: null
          })

          // 3. Return the event before the unassignment went through.
          result = { success: true, event: eventBeforeUnassign }
        } catch (error) {
          if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
            const eventFetchedAsAdmin = await clientReadingAllEvents.event.get({
              eventId
            })
            result = { success: false, event: eventFetchedAsAdmin }
          } else {
            throw error
          }
        }

        assertScopeResult(result, {
          user,
          isUnderAdministrativeArea,
          ...options
        })
      }),
      { numRuns: 20 }
    )
  },
  {
    timeout: 90000
  }
)
