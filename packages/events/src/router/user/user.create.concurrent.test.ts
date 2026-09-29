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

import { encodeScope } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

test('one of two concurrent creates of the same user is rejected as a conflict', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [encodeScope({ type: 'user.create' })])

  const payload = {
    email: 'testing+race@opencrvs.org',
    role: 'admin',
    name: { firstname: 'given', surname: 'family' },
    primaryOfficeId: user.primaryOfficeId
  }

  const results = await Promise.allSettled([
    client.user.create(payload),
    client.user.create(payload)
  ])

  const fulfilled = results.filter((result) => result.status === 'fulfilled')
  const rejected = results.filter((result) => result.status === 'rejected')

  expect(fulfilled).toHaveLength(1)
  expect(rejected).toHaveLength(1)

  /*
   * The duplicate check runs outside the writing transaction, so whether the
   * loser is caught by that check or by the unique constraint depends on how
   * the two requests interleave — only the code is deterministic. An
   * INTERNAL_SERVER_ERROR here means an unmapped constraint violation reached
   * the caller, which is the regression this guards.
   */
  expect(rejected[0].reason).toMatchObject({ code: 'CONFLICT' })
})
