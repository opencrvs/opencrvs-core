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
import {
  ActionType,
  EventDocument,
  JurisdictionFilter,
  TENNIS_CLUB_MEMBERSHIP,
  UserFilter,
  createPrng,
  encodeScope,
  getCurrentEventState,
  getUUID
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createTestClient,
  eventMatchesScope,
  seedEvent
} from '@events/tests/utils'
import { setupHierarchyWithUsers } from '@events/tests/generators'
import { getClient } from '../../storage/postgres/events'
import { EventNotFoundError } from '../../service/events/events'

test('Check scopes against event.actions.notify', async () => {
  const { users, isUnderAdministrativeArea } = await setupHierarchyWithUsers()

  // Client that can read all events,  used to fetch events that test clients cannot access for comparison.
  const clientReadingAllEvents = createTestClient(users[0], [
    encodeScope({
      type: 'record.read',
      options: {
        event: ['tennis-club-membership', 'tennis-club-membership_premium']
      }
    })
  ])

  // 1. Seed EVENTS at 'CREATED' state with various combinations of users and actions.
  const rng = createPrng(1243453)
  const eventsDb = getClient()

  const testUsers = fc.constantFrom(...users)

  const eventConfigArb = fc.constantFrom(tennisClubMembershipEvent, {
    ...tennisClubMembershipEvent,
    id: 'tennis-club-membership_premium'
  })

  const eventSeedArb = fc.record({
    eventConfig: eventConfigArb,
    user: testUsers
  })

  const sampleSize = 200
  const sampledEvents = fc.sample(eventSeedArb, sampleSize)

  for (const seed of sampledEvents) {
    await seedEvent(eventsDb, {
      eventConfig: seed.eventConfig,
      actions: [ActionType.UNASSIGN],
      user: seed.user,
      rng
    })
  }

  // 2. Fetch all events that were just seeded.
  const events = await eventsDb
    .selectFrom('events')
    .select(['id', 'eventType'])
    .execute()

  expect(events.length).toEqual(sampleSize)

  // 3. Setup test combinations with every possible scope and just created events and users.
  const jurisdictionOptions = fc.option(
    fc.constantFrom(...JurisdictionFilter.options),
    { nil: undefined }
  )

  const eventIds = events.map(({ id }) => id)
  const eventTypes = fc.option(
    fc.constantFrom<string[]>(
      [TENNIS_CLUB_MEMBERSHIP],
      [TENNIS_CLUB_MEMBERSHIP, 'tennis-club-membership_premium'],
      ['tennis-club-membership_premium']
    ),
    { nil: undefined }
  )

  const scopeCombinations = fc.record({
    user: testUsers,
    placeOfEvent: jurisdictionOptions,
    event: eventTypes
  })

  // 4. Property based test to verify each combination works as expected.
  await fc.assert(
    fc.asyncProperty(
      scopeCombinations,
      async ({ user, event, placeOfEvent }) => {
        const notifyScope = encodeScope({
          type: 'record.notify',
          options: {
            event,
            placeOfEvent
          }
        })

        // Pick random event for the case. Exclude used events.
        const randomIndex = Math.floor(Math.random() * eventIds.length)
        const [eventId] = eventIds.splice(randomIndex, 1)

        // 5. Create test client with the generated scope and try to fetch the event.
        const testClient = createTestClient(user, [notifyScope])

        await expect(
          testClient.event.actions.assignment.assign({
            eventId,
            transactionId: getUUID(),
            assignedTo: user.id,
            type: ActionType.ASSIGN
          })
        ).resolves.not.toThrow() // Sanity check to ensure the generated scope is valid and does not cause errors unrelated to permissions.

        let result:
          | { success: true; event: EventDocument }
          | { success: false; event: EventDocument } // fetched as admin because the test user could not access it.
        try {
          // We are not testing the notify action itself here, just if the scopes are correctly applied, payload is arbitrary as long as it is valid for the action.
          const response = await testClient.event.actions.notify.request({
            eventId,
            transactionId: getUUID(),
            declaration: {
              'applicant.email': 'test@openrvs.org'
            }
          })
          result = { success: true, event: response }
        } catch (error) {
          if (error instanceof EventNotFoundError) {
            const eventFetchedAsAdmin = await clientReadingAllEvents.event.get({
              eventId
            })

            result = { success: false, event: eventFetchedAsAdmin }
          } else {
            throw error
          }
        }

        const config =
          result.event.type === TENNIS_CLUB_MEMBERSHIP
            ? tennisClubMembershipEvent
            : {
                ...tennisClubMembershipEvent,
                id: 'tennis-club-membership_premium'
              }

        const eventIndex = getCurrentEventState(result.event, config)
        // 6. Verify that the result matches the expected outcome based on scope filters.
        const isAccessibleWithScope = eventMatchesScope({
          eventIndex,
          user,
          declaredBy: undefined,
          registeredBy: undefined,
          declaredIn: undefined,
          registeredIn: undefined,
          event,
          placeOfEvent,
          isUnderAdministrativeArea
        })

        expect(result.success).toBe(isAccessibleWithScope)
      }
    ),
    {
      numRuns: 40
    }
  )
})
