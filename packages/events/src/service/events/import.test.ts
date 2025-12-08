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

import { TRPCError } from '@trpc/server'
import {
  ActionType,
  createPrng,
  generateEventDocument,
  SCOPES
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createSystemTestClient, setupTestCase } from '@events/tests/utils'

describe('bulkImport', () => {
  test('prevents forbidden access if missing required scope', async () => {
    const client = createSystemTestClient('test-system', [])

    await expect(
      client.event.bulkImport([
        generateEventDocument({
          configuration: tennisClubMembershipEvent,
          actions: [{ type: ActionType.CREATE }, { type: ActionType.DECLARE }]
        })
      ])
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })

  test('allows access with import scope', async () => {
    const { user } = await setupTestCase()
    const client = createSystemTestClient('test-system', [SCOPES.RECORD_IMPORT])

    await expect(
      client.event.bulkImport([
        generateEventDocument({
          configuration: tennisClubMembershipEvent,
          actions: [
            { type: ActionType.CREATE, user },
            { type: ActionType.DECLARE, user }
          ]
        })
      ])
    ).resolves.not.toThrow()
  })

  test('importing events indexes them into Elasticsearch at the next refresh', async () => {
    const { user } = await setupTestCase()
    const client = createSystemTestClient('test-system', [
      SCOPES.RECORD_IMPORT,
      SCOPES.RECORD_READ,
      `search[event=${tennisClubMembershipEvent.id},access=all]`
    ])
    const event1 = generateEventDocument({
      configuration: tennisClubMembershipEvent,
      actions: [
        { type: ActionType.CREATE, user },
        { type: ActionType.DECLARE, user }
      ],
      rng: createPrng(871)
    })

    const event2 = generateEventDocument({
      configuration: tennisClubMembershipEvent,
      actions: [
        { type: ActionType.CREATE, user },
        { type: ActionType.DECLARE, user }
      ],
      rng: createPrng(872)
    })
    await client.event.bulkImport([event1, event2])

    // Wait 1 second before searching to allow indexing to complete
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const { results: events } = await client.event.search({
      query: {
        type: 'or',
        clauses: [
          {
            eventType: tennisClubMembershipEvent.id
          }
        ]
      }
    })

    expect(events).toHaveLength(2)
    expect([events[0].id, events[1].id].sort()).toEqual(
      [event1.id, event2.id].sort()
    )
  })
})
