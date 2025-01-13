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

import { createTestClient, setupTestCase } from '@events/tests/utils'

test('Prevents updating event with unknown type', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await expect(
    client.event.patch(
      generator.event.patch(event.id, {
        type: 'EVENT_TYPE_THAT_DOES_NOT_EXIST'
      })
    )
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('stored events can be modified', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const event = await client.event.patch(
    generator.event.patch(originalEvent.id, {
      type: 'TENNIS_CLUB_MEMBERSHIP_PREMIUM'
    })
  )

  expect(event.updatedAt).not.toBe(originalEvent.updatedAt)
  expect(event.type).toBe('TENNIS_CLUB_MEMBERSHIP_PREMIUM')
})
