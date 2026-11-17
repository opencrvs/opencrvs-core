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

import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import { encodeScope, getUUID, UUID } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'
import { createSystemClient } from '@events/storage/postgres/events/system-clients'
import { mswServer } from '../../tests/msw'
import { env } from '../../environment'

/*
 * The user editor chooses the id of a new user, so that it can upload the
 * signature to `users/<id>/` before the user exists.
 */

const notificationSpy = vi.fn()
const fileExistsSpy = vi.fn()

function mockDocuments({ fileExists }: { fileExists: boolean }) {
  mswServer.use(
    http.head(`${env.DOCUMENTS_URL}/files/:filePath*`, ({ params }) => {
      fileExistsSpy(
        typeof params.filePath === 'string'
          ? params.filePath
          : params.filePath?.join('/')
      )
      return fileExists
        ? HttpResponse.json({ ok: true })
        : new HttpResponse(null, { status: 404 })
    }),
    http.post(`${env.COUNTRY_CONFIG_URL}/trigger/user/:event`, () => {
      notificationSpy()
      return HttpResponse.json({})
    })
  )
}

beforeEach(() => {
  notificationSpy.mockReset()
  fileExistsSpy.mockReset()
  mockDocuments({ fileExists: true })
})

async function setup() {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [encodeScope({ type: 'user.create' })])

  return { user, client }
}

function newUserInput(primaryOfficeId: UUID, id = getUUID()) {
  return {
    id,
    email: `user-${id}@opencrvs.org`,
    role: 'admin',
    name: { firstname: 'given', surname: 'family' },
    primaryOfficeId,
    signature: {
      path: `users/${id}/signature.png`,
      originalFilename: 'signature.png',
      type: 'image/png'
    }
  }
}

test('creates the user with the id from the input', async () => {
  const { user, client } = await setup()
  const input = newUserInput(user.primaryOfficeId)

  const created = await client.user.create(input)

  expect(created).toMatchObject({
    id: input.id,
    signature: input.signature.path
  })
  expect(fileExistsSpy).toHaveBeenCalledWith(input.signature.path)
  expect(notificationSpy).toHaveBeenCalledTimes(1)
})

test('creates an id when the input has none', async () => {
  const { user, client } = await setup()
  const { id, ...input } = newUserInput(user.primaryOfficeId)

  const created = await client.user.create(input)

  expect(created.id).not.toBe(id)
  expect(UUID.safeParse(created.id).success).toBe(true)
})

test('rejects an id that a user already has, and sends no notification', async () => {
  const { user, client } = await setup()
  const input = newUserInput(user.primaryOfficeId, user.id)

  await expect(client.user.create(input)).rejects.toMatchObject({
    code: 'CONFLICT',
    message: 'DUPLICATE_ID'
  })
  expect(notificationSpy).not.toHaveBeenCalled()
})

test('rejects an id that a system client already has', async () => {
  const { user, client } = await setup()
  const system = await createSystemClient({
    name: 'An integration',
    createdBy: user.id,
    salt: 'RANDOM_STRING',
    secretHash: 'RANDOM_STRING',
    shaSecret: 'RANDOM_STRING'
  })
  const input = newUserInput(user.primaryOfficeId, system.id as UUID)

  await expect(client.user.create(input)).rejects.toMatchObject({
    code: 'CONFLICT',
    message: 'DUPLICATE_ID'
  })
})

test('rejects a signature file that does not exist, and does not create the user', async () => {
  const { user, client } = await setup()
  mockDocuments({ fileExists: false })
  const input = newUserInput(user.primaryOfficeId)

  await expect(client.user.create(input)).rejects.toMatchObject({
    code: 'BAD_REQUEST',
    message: `File not found: ${input.signature.path}`
  })
  expect(notificationSpy).not.toHaveBeenCalled()

  const stored = await getClient()
    .selectFrom('users')
    .select('id')
    .where('id', '=', input.id)
    .executeTakeFirst()

  expect(stored).toBeUndefined()
})
