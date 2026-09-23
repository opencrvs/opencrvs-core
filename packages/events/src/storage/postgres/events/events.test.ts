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
import { ActionType, createPrng, EventDocument, UUID } from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { seedEvent, setupTestCase } from '@events/tests/utils'
import { streamEventDocuments } from './events'

test('streams every declared event once, one batch per chunk of ids', async () => {
  const { user, eventsDb } = await setupTestCase()
  const rng = createPrng(4312)

  const declaredIds: UUID[] = []
  for (let i = 0; i < 5; i++) {
    const { eventId } = await seedEvent(eventsDb, {
      actions: [ActionType.DECLARE],
      eventConfig: tennisClubMembershipEvent,
      user,
      rng
    })
    declaredIds.push(eventId)
  }
  await seedEvent(eventsDb, {
    actions: [],
    eventConfig: tennisClubMembershipEvent,
    user,
    rng
  })

  const batches: EventDocument[][] = []
  for await (const batch of streamEventDocuments(2)) {
    batches.push(batch)
  }

  // 6 ids in chunks of 2, one of them a draft that is filtered out
  expect(batches.map((batch) => batch.length).sort()).toEqual([1, 2, 2])
  expect(
    batches
      .flat()
      .map(({ id }) => id)
      .sort()
  ).toEqual([...declaredIds].sort())
})
