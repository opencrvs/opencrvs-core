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
import { TRPCError } from '@trpc/server'

test(`prevents forbidden access if missing required scope`, async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await expect(client.event.actions.notify({} as any)).rejects.toMatchObject(
    new TRPCError({ code: 'FORBIDDEN' })
  )
})

test(`allows access if required scope is present`, async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_SUBMIT_INCOMPLETE])

  await expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.event.actions.notify({} as any)
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})
