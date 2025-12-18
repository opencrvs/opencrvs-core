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
  ActionTypes,
  DeclarationActionType,
  EventDocument,
  EventIndex,
  JurisdictionFilter,
  TENNIS_CLUB_MEMBERSHIP,
  UUID,
  UserFilter,
  createPrng,
  encodeScope,
  getCurrentEventState
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createTestClient, seedEvent } from '@events/tests/utils'
import { setupHierarchyWithUsers } from '@events/tests/generators'
import { getClient } from '../../storage/postgres/events'
import { EventNotFoundError } from '../../service/events/events'

/** Determine if an event index matches the provided scope filters. */
function eventMatchesScope({
  eventIndex,
  user,
  declaredBy,
  registeredBy,
  declaredIn,
  registeredIn,
  event,
  isUnderAdministrativeArea
}: {
  eventIndex: EventIndex
  user: { id: UUID; primaryOfficeId: UUID; administrativeAreaId?: UUID | null }
  declaredBy?: UserFilter
  registeredBy?: UserFilter
  declaredIn?: JurisdictionFilter
  registeredIn?: JurisdictionFilter
  event?: string[]
  isUnderAdministrativeArea: (
    locationId: UUID,
    adminAreaId?: UUID | null | undefined
  ) => boolean
}): boolean {
  if (declaredBy === UserFilter.enum.user) {
    if (eventIndex.legalStatuses.DECLARED?.createdBy !== user.id) {
      return false
    }
  }

  if (registeredBy === UserFilter.enum.user) {
    if (eventIndex.legalStatuses.REGISTERED?.createdBy !== user.id) {
      return false
    }
  }

  if (declaredIn === JurisdictionFilter.enum.location) {
    if (
      eventIndex.legalStatuses.DECLARED?.createdAtLocation !==
      user.primaryOfficeId
    ) {
      return false
    }
  }

  if (declaredIn === JurisdictionFilter.enum.administrativeArea) {
    const declaredLocation =
      eventIndex.legalStatuses.DECLARED?.createdAtLocation

    if (!declaredLocation) {
      return false
    }

    if (
      !isUnderAdministrativeArea(
        UUID.parse(eventIndex.legalStatuses.DECLARED?.createdAtLocation),
        user.administrativeAreaId
      )
    ) {
      return false
    }
  }

  if (registeredIn === JurisdictionFilter.enum.location) {
    if (
      eventIndex.legalStatuses.REGISTERED?.createdAtLocation !==
      user.primaryOfficeId
    ) {
      return false
    }
  }

  if (registeredIn === JurisdictionFilter.enum.administrativeArea) {
    const registeredLocation =
      eventIndex.legalStatuses.REGISTERED?.createdAtLocation

    if (!registeredLocation) {
      return false
    }

    if (
      !isUnderAdministrativeArea(
        UUID.parse(eventIndex.legalStatuses.REGISTERED?.createdAtLocation),
        user.administrativeAreaId
      )
    ) {
      return false
    }
  }

  if (event) {
    if (!event.includes(eventIndex.type)) {
      return false
    }
  }

  return true
}

test('Check scopes against get.event', async () => {
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

  const rng = createPrng(1243453)

  const eventsDb = getClient()

  // 1. Seed events with various combinations of users and actions.
  const actionsArb = fc.constantFrom<DeclarationActionType[]>(
    [ActionTypes.enum.DECLARE],
    [ActionTypes.enum.DECLARE, ActionTypes.enum.REGISTER]
  )

  const usersArb = fc.constantFrom(...users)

  const eventConfigArb = fc.constantFrom(tennisClubMembershipEvent, {
    ...tennisClubMembershipEvent,
    id: 'tennis-club-membership_premium'
  })

  const eventSeedArb = fc.record({
    eventConfig: eventConfigArb,
    actions: actionsArb,
    user: usersArb
  })
  const sampleSize = 200

  const sampledEvents = fc.sample(eventSeedArb, sampleSize)

  for (const seed of sampledEvents) {
    await seedEvent(eventsDb, {
      eventConfig: seed.eventConfig,
      actions: seed.actions,
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

  const userOptions = fc.option(fc.constant(UserFilter.enum.user), {
    nil: undefined
  })

  const testUsers = fc.constantFrom(...users)

  const eventIdsArb = fc.constantFrom(...events.map((e) => e.id))
  const eventTypes = fc.option(
    fc.constantFrom<string[]>(
      [TENNIS_CLUB_MEMBERSHIP],
      [TENNIS_CLUB_MEMBERSHIP, 'tennis-club-membership_premium'],
      ['tennis-club-membership_premium']
    ),
    { nil: undefined }
  )
  const scopeCombinations = fc.record({
    eventId: eventIdsArb,
    user: testUsers,
    declaredIn: jurisdictionOptions,
    declaredBy: userOptions,
    registeredIn: jurisdictionOptions,
    registeredBy: userOptions,
    event: eventTypes
  })

  // 4. Property based test to verify each combination works as expected.
  await fc.assert(
    fc.asyncProperty(
      scopeCombinations,
      async ({
        eventId,
        user,
        declaredIn,
        declaredBy,
        event,
        registeredIn,
        registeredBy
      }) => {
        const searchScope = encodeScope({
          type: 'record.read',
          options: {
            event,
            declaredIn,
            declaredBy,
            registeredIn,
            registeredBy
          }
        })

        // 5. Create test client with the generated scope and try to fetch the event.
        const testClient = createTestClient(user, [searchScope])
        let result:
          | { success: true; event: EventDocument }
          | { success: false; event: EventDocument } // fetched as admin because the test user could not access it.
        try {
          const response = await testClient.event.get(eventId)
          result = { success: true, event: response }
        } catch (error) {
          if (error instanceof EventNotFoundError) {
            const eventFetchedAsAdmin =
              await clientReadingAllEvents.event.get(eventId)

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
        const isReadableWithScope = eventMatchesScope({
          eventIndex,
          user,
          declaredBy,
          registeredBy,
          declaredIn,
          registeredIn,
          event,
          isUnderAdministrativeArea
        })

        expect(result.success).toBe(isReadableWithScope)
      }
    ),
    {
      numRuns: 50
    }
  )
})
