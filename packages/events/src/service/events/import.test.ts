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
  DocumentPath,
  encodeScope,
  EventDocument,
  generateEventDocument,
  getUUID
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createSystemTestClient,
  setupTestCase,
  TEST_SYSTEM_ID
} from '@events/tests/utils'

describe('bulkImport', () => {
  test('prevents forbidden access if missing required scope', async () => {
    const client = createSystemTestClient(TEST_SYSTEM_ID, [])

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
    const client = createSystemTestClient(TEST_SYSTEM_ID, [
      encodeScope({ type: 'record.import' })
    ])

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
    const client = createSystemTestClient(TEST_SYSTEM_ID, [
      encodeScope({ type: 'record.import' }),
      encodeScope({ type: 'record.read' }),
      encodeScope({
        type: 'record.search',
        options: {
          event: [tennisClubMembershipEvent.id]
        }
      })
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

  describe('file binding', () => {
    async function importEvents(events: EventDocument[]) {
      return createSystemTestClient(TEST_SYSTEM_ID, [
        encodeScope({ type: 'record.import' })
      ]).event.bulkImport(events)
    }

    function eventWithFiles(
      userId: string,
      files: {
        image: (eventId: string) => string
        signature: (eventId: string) => string
      },
      rng = createPrng(901)
    ) {
      const eventId = getUUID()
      const event = generateEventDocument({
        configuration: tennisClubMembershipEvent,
        rng,
        actions: [
          { type: ActionType.CREATE, user: { id: userId } },
          {
            type: ActionType.DECLARE,
            user: { id: userId },
            declarationOverrides: {
              'applicant.image': {
                type: 'image/png',
                originalFilename: 'image.png',
                path: files.image(eventId) as DocumentPath
              }
            }
          }
        ],
        defaults: { id: eventId }
      })

      return {
        ...event,
        actions: event.actions.map((action) => ({
          ...action,
          createdBySignature: files.signature(eventId) as DocumentPath
        }))
      }
    }

    test("accepts the record's own files, legacy keys and the author's signature", async () => {
      const { user } = await setupTestCase()

      await expect(
        importEvents([
          eventWithFiles(user.id, {
            image: (eventId) => `events/${eventId}/${getUUID()}.png`,
            signature: () => `users/${user.id}/${getUUID()}.png`
          }),
          eventWithFiles(
            user.id,
            {
              image: () => `${getUUID()}.png`,
              signature: () => `${getUUID()}.png`
            },
            createPrng(902)
          )
        ])
      ).resolves.not.toThrow()
    })

    test.each([
      [
        "an image under another record's prefix",
        { image: () => `events/${getUUID()}/${getUUID()}.png` }
      ],
      [
        "an image under a user's prefix",
        { image: () => `users/${getUUID()}/${getUUID()}.png` }
      ],
      [
        "a signature under another user's prefix",
        { signature: () => `users/${getUUID()}/${getUUID()}.png` }
      ],
      [
        "a signature under another record's prefix",
        { signature: () => `events/${getUUID()}/${getUUID()}.png` }
      ],
      [
        'a path that escapes its prefix',
        { image: (eventId: string) => `events/${eventId}/../${getUUID()}.png` }
      ]
    ])('rejects %s', async (_, overrides) => {
      const { user } = await setupTestCase()
      const event = eventWithFiles(user.id, {
        image: (eventId) => `events/${eventId}/${getUUID()}.png`,
        signature: () => `users/${user.id}/${getUUID()}.png`,
        ...overrides
      })

      await expect(importEvents([event])).rejects.toMatchObject({
        code: 'BAD_REQUEST'
      })
    })

    test('stores none of the records when one of them is rejected', async () => {
      const { user, eventsDb } = await setupTestCase()
      const valid = eventWithFiles(user.id, {
        image: (eventId) => `events/${eventId}/${getUUID()}.png`,
        signature: () => `users/${user.id}/${getUUID()}.png`
      })
      const invalid = eventWithFiles(
        user.id,
        {
          image: () => `events/${getUUID()}/${getUUID()}.png`,
          signature: () => `users/${user.id}/${getUUID()}.png`
        },
        createPrng(902)
      )

      await expect(importEvents([valid, invalid])).rejects.toMatchObject({
        code: 'BAD_REQUEST'
      })

      const stored = await eventsDb
        .selectFrom('events')
        .select('id')
        .where('id', 'in', [valid.id, invalid.id])
        .execute()

      expect(stored).toEqual([])
    })
  })
})
