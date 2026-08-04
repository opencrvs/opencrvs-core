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
  JurisdictionFilter,
  TENNIS_CLUB_MEMBERSHIP,
  UserFilter,
  UUID,
  createPrng,
  encodeScope
} from '@opencrvs/commons'
import { createTestClient, TEST_USER_DEFAULT_SCOPES } from '@events/tests/utils'
import {
  payloadGenerator,
  setupHierarchyWithUsers
} from '@events/tests/generators'

test('createdBy scope filter for record.search', async () => {
  const rng = createPrng(19283746)
  const generator = payloadGenerator(rng)

  const { users } = await setupHierarchyWithUsers()

  // Each user creates and notifies one event, so every event has a distinct creator.
  for (const user of users) {
    const testClient = createTestClient(user, TEST_USER_DEFAULT_SCOPES)
    const event = await testClient.event.create(generator.event.create())
    await testClient.event.actions.notify.request(
      generator.event.actions.notify(event.id)
    )
  }

  const userOptions = fc.option(fc.constant(UserFilter.enum.user), {
    nil: undefined
  })

  const combinations = fc.record({
    user: fc.constantFrom(...users),
    createdBy: userOptions
  })

  await fc.assert(
    fc.asyncProperty(combinations, async ({ user, createdBy }) => {
      const searchScope = encodeScope({
        type: 'record.search',
        options: {
          event: [TENNIS_CLUB_MEMBERSHIP],
          createdBy
        }
      })

      const testClient = createTestClient(user, [searchScope])
      const { results } = await testClient.event.search({
        query: {
          type: 'and',
          clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
        }
      })

      // 1. createdBy=user: only the single event this user created is returned.
      if (createdBy === UserFilter.enum.user) {
        expect(results.length).toBe(1)
        for (const r of results) {
          expect(r.createdBy).toBe(user.id)
        }
      }

      // 2. no createdBy filter: every event is returned, regardless of creator.
      if (createdBy === undefined) {
        expect(results.length).toBe(users.length)
      }
    }),
    { numRuns: 100 }
  )
}, 120000)

test('createdIn scope filter for record.search', async () => {
  const rng = createPrng(58392015)
  const generator = payloadGenerator(rng)

  const { users, isUnderAdministrativeArea } = await setupHierarchyWithUsers()

  // Each user creates and notifies one event, so every office holds two events.
  for (const user of users) {
    const testClient = createTestClient(user, TEST_USER_DEFAULT_SCOPES)
    const event = await testClient.event.create(generator.event.create())
    await testClient.event.actions.notify.request(
      generator.event.actions.notify(event.id)
    )
  }

  const jurisdictionOptions = fc.option(
    fc.constantFrom(...JurisdictionFilter.options),
    { nil: undefined }
  )

  const combinations = fc.record({
    user: fc.constantFrom(...users),
    createdIn: jurisdictionOptions
  })

  await fc.assert(
    fc.asyncProperty(combinations, async ({ user, createdIn }) => {
      const searchScope = encodeScope({
        type: 'record.search',
        options: {
          event: [TENNIS_CLUB_MEMBERSHIP],
          createdIn
        }
      })

      const testClient = createTestClient(user, [searchScope])
      const { results } = await testClient.event.search({
        query: {
          type: 'and',
          clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
        }
      })

      // 1. createdIn=location: every event created at the user's own office,
      //    including their colleague's.
      if (createdIn === JurisdictionFilter.enum.location) {
        const usersAtSameOffice = users.filter(
          (other) => other.primaryOfficeId === user.primaryOfficeId
        )

        expect(results.length).toBe(usersAtSameOffice.length)
        expect(results.some((r) => r.createdBy !== user.id)).toBe(true)

        for (const r of results) {
          expect(r.createdAtLocation).toBe(user.primaryOfficeId)
        }
      }

      // 2. createdIn=administrativeArea: everything under the user's area.
      if (createdIn === JurisdictionFilter.enum.administrativeArea) {
        expect(results.length).toBeGreaterThan(0)

        for (const r of results) {
          expect(
            isUnderAdministrativeArea(
              UUID.parse(r.createdAtLocation),
              user.administrativeAreaId ?? null
            )
          ).toBe(true)
        }
      }

      // 3. no createdIn filter (or 'all'): every event is returned.
      if (
        createdIn === undefined ||
        createdIn === JurisdictionFilter.enum.all
      ) {
        expect(results.length).toBe(users.length)
      }
    }),
    { numRuns: 100 }
  )
}, 120000)
