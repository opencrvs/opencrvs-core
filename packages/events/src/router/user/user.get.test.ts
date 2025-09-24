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
import { http, HttpResponse, HttpResponseInit } from 'msw'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { mswServer } from '../../tests/msw'

test('Throws error if user not found with id', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)
  mswServer.use(
    http.post(`http://localhost:3030/getUser`, () => {
      return HttpResponse.json([], { status: 404 } as HttpResponseInit)
    })
  )
  await expect(client.user.get('123-123-123')).rejects.toMatchObject(
    new TRPCError({ code: 'NOT_FOUND' })
  )
})

test('Returns user in correct format if found', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user)
  mswServer.use(
    http.post(`http://localhost:3030/getUser`, () => {
      return HttpResponse.json(user)
    })
  )
  const fetchedUser = await client.user.get(user.id)

  expect(fetchedUser).toEqual({
    id: user.id,
    name: user.name,
    role: user.role,
    signature: user.signature,
    primaryOfficeId: user.primaryOfficeId
  })
})

test('Returns user with full honorific name when defined', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user)
  const userWithHonorific = {
    ...user,
    fullHonorificName: 'Dr. John Doe, PhD'
  }

  mswServer.use(
    http.post(`http://localhost:3030/getUser`, () => {
      return HttpResponse.json(userWithHonorific)
    })
  )
  const fetchedUser = await client.user.get(user.id)

  expect(fetchedUser).toEqual({
    id: user.id,
    name: user.name,
    role: user.role,
    signature: user.signature,
    primaryOfficeId: user.primaryOfficeId,
    fullHonorificName: userWithHonorific.fullHonorificName
  })
})
