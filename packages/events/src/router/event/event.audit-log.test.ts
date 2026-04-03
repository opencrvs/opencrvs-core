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
import { encodeScope, SCOPES, TENNIS_CLUB_MEMBERSHIP } from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'
import { getLocations } from '@events/storage/postgres/administrative-hierarchy/locations'

describe('audit log', () => {
  describe('event.create', () => {
    test('writes an audit log entry when a system client creates an event', async () => {
      const { generator, locations } = await setupTestCase()
      const systemId = 'test-system'
      const client = createSystemTestClient(systemId, [
        encodeScope({
          type: 'record.create',
          options: { event: [TENNIS_CLUB_MEMBERSHIP] }
        })
      ])

      const createEventInput = {
        ...generator.event.create(),
        createdAtLocation: locations[0].id
      }

      const event = await client.event.create(createEventInput)

      const db = getClient()
      const logs = await db
        .selectFrom('auditLog')
        .selectAll()
        .where('clientId', '=', systemId)
        .execute()

      expect(logs).toHaveLength(1)
      expect(logs[0].operation).toBe('event.create')
      expect(logs[0].clientType).toBe('system')
      expect(logs[0].requestData).toMatchObject({
        createdAtLocation: locations[0].id,
        transactionId: createEventInput.transactionId,
        type: event.type
      })
      expect(logs[0].responseSummary).toMatchObject({
        eventId: event.id,
        trackingId: event.trackingId
      })
    })
  })

  describe('event.get', () => {
    test('writes an audit log entry when a system client fetches an event', async () => {
      const { generator, locations } = await setupTestCase()
      const systemId = 'test-system'

      const systemClient = createSystemTestClient(systemId, [
        encodeScope({
          type: 'record.create',
          options: { event: [TENNIS_CLUB_MEMBERSHIP] }
        }),
        encodeScope({
          type: 'record.read',
          options: { event: [TENNIS_CLUB_MEMBERSHIP] }
        })
      ])
      const event = await systemClient.event.create({
        ...generator.event.create(),
        createdAtLocation: locations[0].id
      })
      await systemClient.event.get({ eventId: event.id })

      const db = getClient()
      const logs = await db
        .selectFrom('auditLog')
        .selectAll()
        .where('clientId', '=', systemId)
        .where('operation', '=', 'event.get')
        .execute()

      expect(logs).toHaveLength(1)
      expect(logs[0].operation).toBe('event.get')
      expect(logs[0].requestData).toMatchObject({ eventId: event.id })
      expect(logs[0].responseSummary).toMatchObject({
        eventType: event.type,
        trackingId: event.trackingId
      })
    })
  })

  describe('event.actions.notify', () => {
    test('writes an audit log entry when a system client notifies an event', async () => {
      const { generator } = await setupTestCase()
      const systemId = 'test-system'
      const locations = await getLocations()

      const client = createSystemTestClient(systemId, [
        encodeScope({
          type: 'record.create',
          options: { event: [TENNIS_CLUB_MEMBERSHIP] }
        }),
        encodeScope({
          type: 'record.notify',
          options: { event: [TENNIS_CLUB_MEMBERSHIP] }
        })
      ])

      const event = await client.event.create({
        ...generator.event.create(),
        createdAtLocation: locations[0].id
      })

      await client.event.actions.notify.request({
        ...generator.event.actions.notify(event.id),
        createdAtLocation: locations[0].id
      })

      const db = getClient()
      const logs = await db
        .selectFrom('auditLog')
        .selectAll()
        .where('clientId', '=', systemId)
        .where('operation', '=', 'event.actions.notify.request')
        .execute()

      expect(logs).toHaveLength(1)
      expect(logs[0].operation).toBe('event.actions.notify.request')
      expect(logs[0].clientType).toBe('system')
      expect(logs[0].responseSummary).toBeNull()
    })
  })

  describe('event.search', () => {
    test('writes an audit log entry when a system client searches for events', async () => {
      const systemId = 'test-system'
      const client = createSystemTestClient(systemId, [
        encodeScope({ type: 'record.search' })
      ])

      const searchInput = {
        query: {
          type: 'and' as const,
          clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
        }
      }

      const result = await client.event.search(searchInput)

      const db = getClient()
      const logs = await db
        .selectFrom('auditLog')
        .selectAll()
        .where('clientId', '=', systemId)
        .execute()

      expect(logs).toHaveLength(1)
      expect(logs[0].operation).toBe('event.search')
      expect(logs[0].clientType).toBe('system')
      expect(logs[0].responseSummary).toMatchObject({
        total: result.total,
        eventIds: result.results.map((r) => r.id)
      })
    })

    test('does not write any audit log entry when a human user searches for events', async () => {
      const { user } = await setupTestCase()
      const client = createTestClient(user, [
        encodeScope({ type: 'record.search' })
      ])
      const searchInput = {
        query: {
          type: 'and',
          clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
        }
      }

      await client.event.search(searchInput)

      const db = getClient()
      const logs = await db
        .selectFrom('auditLog')
        .selectAll()
        .where('clientId', '=', user.id)
        .execute()

      expect(logs).toHaveLength(0)
    })
  })

  describe('integrations.create', () => {
    test('writes an audit log entry when a system client creates an integration', async () => {
      const systemId = '00000000-0000-0000-0000-000000000099'
      const client = createSystemTestClient(systemId, [
        SCOPES.INTEGRATION_CREATE
      ])

      const result = await client.integrations.create({
        name: 'My Integration',
        scopes: [SCOPES.RECORD_IMPORT]
      })

      const db = getClient()
      const logs = await db
        .selectFrom('auditLog')
        .selectAll()
        .where('clientId', '=', systemId)
        .execute()

      expect(logs).toHaveLength(1)
      expect(logs[0].operation).toBe('integrations.create')
      expect(logs[0].requestData).toMatchObject({
        name: 'My Integration',
        scopes: [SCOPES.RECORD_IMPORT]
      })
      expect(logs[0].responseSummary).toMatchObject({
        clientId: result.clientId
      })
    })

    test('does not include credentials in audit log response summary', async () => {
      const systemId = '00000000-0000-0000-0000-000000000099'
      const client = createSystemTestClient(systemId, [
        SCOPES.INTEGRATION_CREATE
      ])

      await client.integrations.create({
        name: 'My Integration',
        scopes: [SCOPES.RECORD_IMPORT]
      })

      const db = getClient()
      const logs = await db
        .selectFrom('auditLog')
        .selectAll()
        .where('clientId', '=', systemId)
        .execute()

      expect(logs[0].responseSummary).not.toHaveProperty('shaSecret')
      expect(logs[0].responseSummary).not.toHaveProperty('clientSecret')
    })
  })

  describe('attachments.upload', () => {
    test('writes an audit log entry when a system client uploads an attachment', async () => {
      const systemId = 'test-system'
      const expectedFileUrl = '/ocrvs/test-event/abc123.jpg'

      mswServer.use(
        http.post(`${env.DOCUMENTS_URL}/files`, () => {
          return HttpResponse.text(expectedFileUrl)
        })
      )

      const client = createSystemTestClient(systemId, [
        SCOPES.ATTACHMENT_UPLOAD
      ])

      const formData = new FormData()
      formData.append(
        'file',
        new Blob(['test file content'], { type: 'image/jpeg' }),
        'test.jpg'
      )
      formData.append('transactionId', 'abc123')
      formData.append('path', 'test-event')

      await client.attachments.upload(formData)

      const db = getClient()
      const logs = await db
        .selectFrom('auditLog')
        .selectAll()
        .where('clientId', '=', systemId)
        .execute()

      expect(logs).toHaveLength(1)
      expect(logs[0].operation).toBe('attachments.upload')
      expect(logs[0].clientType).toBe('system')
      expect(logs[0].responseSummary).toMatchObject({
        fileUrl: expectedFileUrl
      })
    })
  })
})
