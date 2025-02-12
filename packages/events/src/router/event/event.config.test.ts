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
import { SCOPES } from '@opencrvs/commons'

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  await expect(client.event.config.get()).rejects.matchSnapshot()
})

test('event config can be fetched', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.CONFIG_EVENT_READ])
  const config = await client.event.config.get()

  expect(config[0].id).toEqual('TENNIS_CLUB_MEMBERSHIP')
  expect(config[1].id).toEqual('TENNIS_CLUB_MEMBERSHIP_PREMIUM')

  expect(config.length).toEqual(2)
})
