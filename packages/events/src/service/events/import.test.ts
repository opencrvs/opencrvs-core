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
import { ActionType, generateEventDocument, SCOPES } from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createSystemTestClient, setupTestCase } from '@events/tests/utils'

describe('import', () => {
  test(`prevents forbidden access if missing required scope`, async () => {
    const client = createSystemTestClient('test-system', [])

    await expect(
      client.event.import(
        generateEventDocument({
          configuration: tennisClubMembershipEvent,
          actions: [ActionType.CREATE, ActionType.DECLARE]
        })
      )
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })

  test('allows access with import scope', async () => {
    const { user } = await setupTestCase()
    const client = createSystemTestClient('test-system', [SCOPES.RECORD_IMPORT])

    await expect(
      client.event.import(
        generateEventDocument({
          user,
          configuration: tennisClubMembershipEvent,
          actions: [ActionType.CREATE, ActionType.DECLARE]
        })
      )
    ).resolves.not.toThrow()
  })

  test('importing an event indexes it into Elasticsearch', async () => {
    const { user } = await setupTestCase()
    const client = createSystemTestClient('test-system', [
      SCOPES.RECORD_IMPORT,
      SCOPES.RECORD_READ,
      `search[event=${tennisClubMembershipEvent.id},access=all]`
    ])
    const event = generateEventDocument({
      user,
      configuration: tennisClubMembershipEvent,
      actions: [ActionType.CREATE, ActionType.DECLARE]
    })

    await client.event.import(event)

    const { results: events } = await client.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            eventType: tennisClubMembershipEvent.id
          }
        ]
      }
    })

    expect(events).toHaveLength(1)
    expect(events[0].id).toEqual(event.id)
  })

  test('importing the same event twice overwrites the previous one', async () => {
    const { user } = await setupTestCase()
    const client = createSystemTestClient('test-system', [
      SCOPES.RECORD_IMPORT,
      SCOPES.RECORD_READ,
      `search[event=${tennisClubMembershipEvent.id},access=all]`
    ])
    const event = generateEventDocument({
      user,
      configuration: tennisClubMembershipEvent,
      actions: [ActionType.CREATE, ActionType.DECLARE]
    })

    await client.event.import(event)

    await client.event.import({ ...event, trackingId: 'ABCDEF' })

    const { results: events } = await client.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            eventType: tennisClubMembershipEvent.id
          }
        ]
      }
    })

    expect(events).toHaveLength(1)
    expect(events[0].id).toEqual(event.id)
    expect(events[0].trackingId).toEqual('ABCDEF')
  })
})

describe('bulkImport', () => {
  test('prevents forbidden access if missing required scope', async () => {
    const client = createSystemTestClient('test-system', [])

    await expect(
      client.event.bulkImport([
        generateEventDocument({
          configuration: tennisClubMembershipEvent,
          actions: [ActionType.CREATE, ActionType.DECLARE]
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
          user,
          configuration: tennisClubMembershipEvent,
          actions: [ActionType.CREATE, ActionType.DECLARE]
        })
      ])
    ).resolves.not.toThrow()
  })

  test('successfully imports multiple events in bulk', async () => {
    const { user } = await setupTestCase()
    const client = createSystemTestClient('test-system', [
      SCOPES.RECORD_IMPORT,
      SCOPES.RECORD_READ,
      `search[event=${tennisClubMembershipEvent.id},access=all]`
    ])

    const event1 = generateEventDocument({
      user,
      configuration: tennisClubMembershipEvent,
      actions: [ActionType.CREATE, ActionType.DECLARE]
    })
    const event2 = generateEventDocument({
      user,
      configuration: tennisClubMembershipEvent,
      actions: [ActionType.CREATE, ActionType.DECLARE]
    })
    const event3 = generateEventDocument({
      user,
      configuration: tennisClubMembershipEvent,
      actions: [ActionType.CREATE, ActionType.DECLARE]
    })

    const result = await client.event.bulkImport([event1, event2, event3])

    expect(result.successful).toHaveLength(3)
    expect(result.failed).toHaveLength(0)
    expect(result.successful.map((e) => e.id)).toEqual(
      expect.arrayContaining([event1.id, event2.id, event3.id])
    )
  })

  test('importing events indexes them into Elasticsearch at the next refresh', async () => {
    const { user } = await setupTestCase()
    const client = createSystemTestClient('test-system', [
      SCOPES.RECORD_IMPORT,
      SCOPES.RECORD_READ,
      `search[event=${tennisClubMembershipEvent.id},access=all]`
    ])
    const event1 = generateEventDocument({
      user,
      configuration: tennisClubMembershipEvent,
      actions: [ActionType.CREATE, ActionType.DECLARE]
    })

    const event2 = generateEventDocument({
      user,
      configuration: tennisClubMembershipEvent,
      actions: [ActionType.CREATE, ActionType.DECLARE]
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
    expect([events[0].id, events[1].id]).toEqual([event1.id, event2.id])
  })

  test('handles empty array gracefully', async () => {
    const client = createSystemTestClient('test-system', [SCOPES.RECORD_IMPORT])

    const result = await client.event.bulkImport([])

    expect(result.successful).toHaveLength(0)
    expect(result.failed).toHaveLength(0)
  })
})
