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
import { http, HttpResponse } from 'msw'
import {
  encodeScope,
  getUUID,
  MAX_UPLOAD_SIZE_BYTES,
  TENNIS_CLUB_MEMBERSHIP
} from '@opencrvs/commons'
import { env } from '@events/environment'
import { mswServer } from '@events/tests/msw'
import {
  createSystemTestClient,
  createTestClient,
  createUnauthenticatedTestClient,
  setupTestCase,
  TEST_SYSTEM_ID
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'

const readTennisClub = encodeScope({
  type: 'record.read',
  options: { event: [TENNIS_CLUB_MEMBERSHIP] }
})

const declareTennisClub = encodeScope({
  type: 'record.declare',
  options: { event: [TENNIS_CLUB_MEMBERSHIP] }
})

const declareTennisClubInOwnOffice = encodeScope({
  type: 'record.declare',
  options: { event: [TENNIS_CLUB_MEMBERSHIP], createdIn: 'location' }
})

const editUsers = encodeScope({ type: 'user.edit' })
const editUsersInOwnOffice = encodeScope({
  type: 'user.edit',
  options: { accessLevel: 'location' }
})
const createUsers = encodeScope({ type: 'user.create' })

function uploadFields() {
  return {
    transactionId: getUUID(),
    extension: 'png',
    contentType: 'image/png',
    contentLength: 1024
  }
}

async function setupEvent() {
  const testCase = await setupTestCase()
  const event = await createTestClient(testCase.user).event.create(
    testCase.generator.event.create()
  )
  return { ...testCase, event }
}

describe('attachments.presignEventUpload', () => {
  test('refuses a request without a token', async () => {
    const client = await createUnauthenticatedTestClient()

    await expect(
      client.attachments.presignEventUpload({
        ...uploadFields(),
        eventId: getUUID()
      })
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  test('refuses a user who can only read the record', async () => {
    const { users, event } = await setupEvent()

    await expect(
      createTestClient(users[1], [
        readTennisClub
      ]).attachments.presignEventUpload({
        ...uploadFields(),
        eventId: event.id
      })
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })

  test('gives the same error for a missing record and a record out of jurisdiction', async () => {
    const { users, event } = await setupEvent()
    const client = createTestClient(users[1], [declareTennisClubInOwnOffice])

    const missing = client.attachments.presignEventUpload({
      ...uploadFields(),
      eventId: getUUID()
    })
    const outOfJurisdiction = client.attachments.presignEventUpload({
      ...uploadFields(),
      eventId: event.id
    })

    await expect(missing).rejects.toMatchObject({ code: 'NOT_FOUND' })
    await expect(outOfJurisdiction).rejects.toMatchObject({
      code: 'NOT_FOUND'
    })
  })

  test('refuses a system client', async () => {
    const { event } = await setupEvent()

    await expect(
      createSystemTestClient(TEST_SYSTEM_ID, [
        declareTennisClub
      ]).attachments.presignEventUpload({
        ...uploadFields(),
        eventId: event.id
      })
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })

  test('returns an upload URL for a key under the record prefix and writes an audit entry', async () => {
    const { users, event } = await setupEvent()
    const fields = uploadFields()
    let documentsRequest: unknown

    mswServer.use(
      http.post(
        `${env.DOCUMENTS_URL}/presigned-upload-url`,
        async ({ request }) => {
          documentsRequest = await request.json()
          return HttpResponse.json({
            url: 'http://localhost:9000/ocrvs/signed',
            headers: { 'Content-Type': 'image/png' }
          })
        }
      )
    )

    const result = await createTestClient(users[1], [
      declareTennisClub
    ]).attachments.presignEventUpload({ ...fields, eventId: event.id })

    const path = `events/${event.id}/${fields.transactionId}.png`
    expect(result).toEqual({
      url: 'http://localhost:9000/ocrvs/signed',
      headers: { 'Content-Type': 'image/png' },
      path
    })
    expect(documentsRequest).toEqual({
      filePath: path,
      contentType: 'image/png',
      contentLength: 1024
    })

    const logs = await getClient()
      .selectFrom('auditLog')
      .selectAll()
      .where('clientId', '=', users[1].id)
      .where('operation', '=', 'attachments.presignEventUpload')
      .execute()

    expect(logs).toHaveLength(1)
    expect(logs[0].requestData).toEqual({
      transactionId: fields.transactionId,
      eventId: event.id,
      path
    })
  })

  test('returns FORBIDDEN when another user uploaded a file to the same key', async () => {
    const { user, event } = await setupEvent()

    mswServer.use(
      http.post(
        `${env.DOCUMENTS_URL}/presigned-upload-url`,
        () => new HttpResponse(null, { status: 403 })
      )
    )

    await expect(
      createTestClient(user, [
        declareTennisClub
      ]).attachments.presignEventUpload({
        ...uploadFields(),
        eventId: event.id
      })
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })

  test.each([
    ['an extension with a path separator', { extension: '../x' }],
    ['an empty extension', { extension: '' }],
    ['a transaction id that is not a UUID', { transactionId: 'abc123' }],
    ['an empty content type', { contentType: '' }],
    ['an empty file', { contentLength: 0 }],
    ['a file over the size limit', { contentLength: MAX_UPLOAD_SIZE_BYTES + 1 }]
  ])('refuses %s', async (_, override) => {
    const { user, event } = await setupEvent()

    await expect(
      createTestClient(user, [
        declareTennisClub
      ]).attachments.presignEventUpload({
        ...uploadFields(),
        ...override,
        eventId: event.id
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })
})

describe('attachments.presignUserUpload', () => {
  test('lets a user upload to their own prefix without user scopes', async () => {
    const { user } = await setupTestCase()
    const fields = uploadFields()

    const result = await createTestClient(
      user,
      []
    ).attachments.presignUserUpload({ ...fields, userId: user.id })

    const path = `users/${user.id}/${fields.transactionId}.png`
    expect(result.path).toBe(path)

    const logs = await getClient()
      .selectFrom('auditLog')
      .selectAll()
      .where('clientId', '=', user.id)
      .where('operation', '=', 'attachments.presignUserUpload')
      .execute()

    expect(logs).toHaveLength(1)
    expect(logs[0].requestData).toEqual({
      transactionId: fields.transactionId,
      userId: user.id,
      path
    })
  })

  test('refuses another user without user scopes', async () => {
    const { user, users } = await setupTestCase()

    await expect(
      createTestClient(user, [readTennisClub]).attachments.presignUserUpload({
        ...uploadFields(),
        userId: users[1].id
      })
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })

  test('lets a user with user.edit upload for a user they can edit', async () => {
    const { user, users } = await setupTestCase()
    const fields = uploadFields()

    const result = await createTestClient(user, [
      editUsers
    ]).attachments.presignUserUpload({ ...fields, userId: users[1].id })

    expect(result.path).toBe(`users/${users[1].id}/${fields.transactionId}.png`)
  })

  test('refuses a user with user.edit for a user outside their jurisdiction', async () => {
    const { user, users } = await setupTestCase()

    await expect(
      createTestClient(user, [
        editUsersInOwnOffice
      ]).attachments.presignUserUpload({
        ...uploadFields(),
        userId: users[1].id
      })
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })

  test('lets a user with user.create upload for a user that does not exist yet', async () => {
    const { user } = await setupTestCase()
    const newUserId = getUUID()
    const fields = uploadFields()

    const result = await createTestClient(user, [
      createUsers
    ]).attachments.presignUserUpload({ ...fields, userId: newUserId })

    expect(result.path).toBe(`users/${newUserId}/${fields.transactionId}.png`)
  })

  test('refuses a user with only user.edit for a user that does not exist', async () => {
    const { user } = await setupTestCase()

    await expect(
      createTestClient(user, [editUsers]).attachments.presignUserUpload({
        ...uploadFields(),
        userId: getUUID()
      })
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })

  test('refuses a system client', async () => {
    const { user } = await setupTestCase()

    await expect(
      createSystemTestClient(TEST_SYSTEM_ID, [
        editUsers,
        createUsers
      ]).attachments.presignUserUpload({
        ...uploadFields(),
        userId: user.id
      })
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })
})
