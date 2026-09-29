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
import { UserFilter, createPrng, encodeScope } from '@opencrvs/commons'
import {
  assertScopeResult,
  attemptScopedAction,
  createTestClient,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import {
  payloadGenerator,
  setupHierarchyWithUsers
} from '@events/tests/generators'

test('createdBy scope filter for record.edit', async () => {
  const rng = createPrng(56473829)
  const generator = payloadGenerator(rng)

  const { users, isUnderAdministrativeArea } = await setupHierarchyWithUsers()

  // Each user creates and notifies one event, so every event has a distinct creator.
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

  const userOptions = fc.option(fc.constant(UserFilter.enum.user), {
    nil: undefined
  })

  const combinations = fc.record({
    user: fc.constantFrom(...users),
    createdBy: userOptions
  })

  await fc.assert(
    fc.asyncProperty(combinations, async ({ user, createdBy }) => {
      const scope = encodeScope({
        type: 'record.edit',
        options: { createdBy }
      })

      // Consume one event per run so the same event is never assigned twice.
      const randomIndex = Math.floor(Math.random() * eventIds.length)
      const [eventId] = eventIds.splice(randomIndex, 1)

      const result = await attemptScopedAction(
        eventId,
        user,
        scope,
        clientReadingAllEvents,
        async (client) =>
          client.event.actions.edit.request(
            generator.event.actions.edit(eventId)
          )
      )

      assertScopeResult(result, {
        user,
        event: undefined,
        placeOfEvent: undefined,
        isUnderAdministrativeArea,
        createdBy
      })
    }),
    { numRuns: 20 }
  )
}, 120000)
