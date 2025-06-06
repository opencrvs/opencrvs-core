import { TRPCError } from '@trpc/server'
import _ from 'lodash'
import { WorkqueueCountInput } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

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

test('Throws error if Query includes workqueue that the user does not have scope for', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)
  const input: WorkqueueCountInput = [
    {
      slug: 'first-workqueue',
      query: {
        type: 'and',
        clauses: []
      }
    },
    {
      slug: 'second-workqueue',
      query: {
        type: 'or',
        clauses: []
      }
    }
  ]
  await expect(client.workqueue.count(input)).rejects.toMatchObject(
    new TRPCError({ code: 'FORBIDDEN' })
  )
})
test('Slugs in response matches input', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)
  const input: WorkqueueCountInput = [
    {
      slug: 'recent',
      query: {
        type: 'and',
        clauses: []
      }
    },
    {
      slug: 'assigned-to-you',
      query: {
        type: 'or',
        clauses: []
      }
    }
  ]
  const counts = await client.workqueue.count(input)
  const response_slugs = Object.keys(counts)
  const input_slugs = input.map(({ slug }) => slug)

  expect(_.sortBy(response_slugs)).toEqual(_.sortBy(input_slugs))
})
