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
import { ActionType, SCOPES } from '@opencrvs/commons'

test('Validation error message contains all the offending fields', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_REGISTER])

  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.register(event.id, {
    data: {
      'applicant.dob': '02-02'
    }
  })

  await expect(client.event.actions.register(data)).rejects.matchSnapshot()
})

test('Action without form definition should accept empty payload', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.validate(event.id, {
    data: {}
  })

  const result = await client.event.actions.validate(data)
  const lastAction = result.actions[result.actions.length - 1]

  expect(lastAction.type).toBe(ActionType.VALIDATE)
  expect(lastAction.data).toEqual({})
})
