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
  createPrng,
  encodeScope,
  getOrThrow
} from '@opencrvs/commons'
import { createTestClient, TEST_USER_DEFAULT_SCOPES } from '@events/tests/utils'
import {
  payloadGenerator,
  setupHierarchyWithUsers
} from '@events/tests/generators'

test('notifiedIn and notifiedBy scope filters for record.search', async () => {
  const rng = createPrng(98765432)
  const generator = payloadGenerator(rng)

  const { users, isUnderAdministrativeArea } = await setupHierarchyWithUsers()

  // Each user creates and notifies one event so every office/user combo is represented.
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
      const searchScope = encodeScope({
        type: 'record.search',
        options: {
          event: [TENNIS_CLUB_MEMBERSHIP],
          notifiedIn,
          notifiedBy
        }
      })

      const testClient = createTestClient(user, [searchScope])
      const { results } = await testClient.event.search({
        query: {
          type: 'and',
          clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
        }
      })

      // There must always be some results — even the strictest filters match at least one event.
      expect(results.length).toBeGreaterThan(0)

      // 1. notifiedBy=user: only events notified by this user are returned.
      if (notifiedBy === UserFilter.enum.user) {
        for (const r of results) {
          expect(r.legalStatuses.NOTIFIED?.createdBy).toBe(user.id)
        }
      }

      // 2. notifiedIn=location: only events notified from the user's exact office.
      if (notifiedIn === JurisdictionFilter.enum.location) {
        for (const r of results) {
          expect(r.legalStatuses.NOTIFIED?.createdAtLocation).toBe(
            user.primaryOfficeId
          )
        }
      }

      // 3. notifiedIn=administrativeArea: only events notified from within the user's jurisdiction.
      if (notifiedIn === JurisdictionFilter.enum.administrativeArea) {
        for (const r of results) {
          const officeId = getOrThrow(
            r.legalStatuses.NOTIFIED?.createdAtLocation,
            'createdAtLocation is undefined'
          )
          expect(
            isUnderAdministrativeArea(officeId, user.administrativeAreaId)
          ).toBe(true)
        }
      }

      // 4. notifiedIn=all with no notifiedBy: all notified events are returned.
      if (
        notifiedIn === JurisdictionFilter.enum.all &&
        notifiedBy === undefined
      ) {
        expect(results.length).toBe(users.length)
      }
    }),
    { numRuns: 200 }
  )
})
