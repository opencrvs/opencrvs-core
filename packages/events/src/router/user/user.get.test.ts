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
import { TRPCError } from '@trpc/server'

test('Throws error if user not found with id', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  await expect(client.user.get('123-123-123')).rejects.toMatchObject(
    new TRPCError({ code: 'NOT_FOUND' })
  )
})

test('Returns user in correct format if found', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  const fetchedUser = await client.user.get(user.id)

  expect(fetchedUser).toEqual({
    id: user.id,
    name: user.name,
    role: user.role
  })
})
