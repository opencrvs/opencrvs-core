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
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.archive(
      generator.event.actions.archive('event-test-id-12345', {})
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_DECLARATION_ARCHIVE])

  await expect(
    client.event.actions.archive(
      generator.event.actions.archive('event-test-id-12345', {})
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`should contain both marked_as_duplicate and archived action if marked as duplicate`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const declareInput = generator.event.actions.declare(originalEvent.id)

  await client.event.actions.declare(declareInput)

  const actions = (
    await client.event.actions.archive(
      generator.event.actions.archive(originalEvent.id, {}, true)
    )
  ).actions.map(({ type }) => type)

  expect(actions.at(-1)).toStrictEqual('ARCHIVED')
  expect(actions.at(-2)).toStrictEqual('MARKED_AS_DUPLICATE')
})

test(`should only contain archived action if not marked as duplicate`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const declareInput = generator.event.actions.declare(originalEvent.id)

  await client.event.actions.declare(declareInput)

  const actions = (
    await client.event.actions.archive(
      generator.event.actions.archive(originalEvent.id)
    )
  ).actions.map(({ type }) => type)

  expect(actions.at(-1)).toStrictEqual('ARCHIVED')
  expect(actions.at(-2)).not.toStrictEqual('MARKED_AS_DUPLICATE')
})
