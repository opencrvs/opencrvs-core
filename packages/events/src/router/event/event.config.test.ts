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
import { TENNIS_CLUB_MEMBERSHIP, FieldType } from '@opencrvs/commons'
import { getAllUniqueFields } from '@opencrvs/commons/events'
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'

test(`prevents forbidden access if accessing as system user`, async () => {
  await setupTestCase()
  const client = createSystemTestClient('test-system', [])

  await expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.event.config.get({} as any)
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('user can fetch event config without scopes', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])
  const config = await client.event.config.get()

  expect(config[0].id).toEqual(TENNIS_CLUB_MEMBERSHIP)
  expect(config[1].id).toEqual('tennis-club-membership_premium')

  expect(config.length).toEqual(2)
})

test('event config checkbox fields has a default value', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)
  const configs = await client.event.config.get()
  const checkboxFields = getAllUniqueFields(configs[0]).filter(
    (f) => f.type === FieldType.CHECKBOX
  )

  // Fields should be parsed with default values
  checkboxFields.map((field) => expect(field.defaultValue).toBe(false))
})
//
