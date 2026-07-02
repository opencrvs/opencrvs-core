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
  EventDocument,
  JurisdictionFilter,
  TENNIS_CLUB_MEMBERSHIP,
  UserFilter,
  createPrng,
  encodeScope,
  getDeclarationFields
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  assertScopeResult,
  createTestClient,
  setupScopeTestFixture,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import {
  payloadGenerator,
  setupHierarchyWithUsers
} from '@events/tests/generators'
import { createIndex } from '@events/service/indexing/indexing'
import { getEventIndexName } from '@events/storage/elasticsearch'
import { EventNotFoundError } from '../../service/events/events'

test('Check scopes against event.get', async () => {
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
        type: 'record.read',
        options
      })

      const randomIndex = Math.floor(Math.random() * eventIds.length)
      const [eventId] = eventIds.splice(randomIndex, 1)

      const testClient = createTestClient(user, [scope])

      let result: { success: boolean; event: EventDocument }
      try {
        // 1. Perform the action with the given test client.
        const eventFetchedAsUser = await testClient.event.get({ eventId })
        result = { success: true, event: eventFetchedAsUser }
      } catch (error) {
        if (error instanceof EventNotFoundError) {
          // 2. If action fails, attempt to fetch the event with the client that has access to all events to verify the failure was due to scope restrictions.
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
    { numRuns: 40 }
  )
})

test('Check notifiedIn and notifiedBy scopes against event.get', async () => {
  const rng = createPrng(55667788)
  const generator = payloadGenerator(rng)

  const { users, isUnderAdministrativeArea } = await setupHierarchyWithUsers()

  // Each user creates and notifies one event so every office/user combo is represented.
  const eventIds: string[] = []
  for (const user of users) {
    const testClient = createTestClient(user, TEST_USER_DEFAULT_SCOPES)
    const event = await testClient.event.create(generator.event.create())
    await testClient.event.actions.notify.request(
      generator.event.actions.notify(event.id)
    )
    eventIds.push(event.id)
  }

  const clientReadingAllEvents = createTestClient(users[0], [
    encodeScope({ type: 'record.read' })
  ])

  const jurisdictionOptions = fc.option(
    fc.constantFrom(...JurisdictionFilter.options),
    { nil: undefined }
  )

  const userOptions = fc.option(fc.constant(UserFilter.enum.user), {
    nil: undefined
  })

  const combinations = fc.record({
    user: fc.constantFrom(...users),
    notifiedIn: jurisdictionOptions,
    notifiedBy: userOptions
  })

  await fc.assert(
    fc.asyncProperty(combinations, async ({ user, notifiedIn, notifiedBy }) => {
      const scope = encodeScope({
        type: 'record.read',
        options: { notifiedIn, notifiedBy }
      })

      const randomIndex = Math.floor(Math.random() * eventIds.length)
      const [eventId] = eventIds.splice(randomIndex, 1)

      const testClient = createTestClient(user, [scope])

      let result: { success: boolean; event: EventDocument }
      try {
        const eventFetchedAsUser = await testClient.event.get({ eventId })
        result = { success: true, event: eventFetchedAsUser }
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

      assertScopeResult(result, {
        user,
        event: undefined,
        placeOfEvent: undefined,
        isUnderAdministrativeArea,
        notifiedIn,
        notifiedBy
      })
    }),
    { numRuns: 20 }
  )
}, 120000)
