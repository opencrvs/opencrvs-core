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
import {
  getUUID,
  encodeScope,
  SCOPES,
  TENNIS_CLUB_MEMBERSHIP
} from '@opencrvs/commons'
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
      const systemId = getUUID()
      const client = createSystemTestClient(systemId, [
        encodeScope({
          type: 'record.create',
          options: { event: [TENNIS_CLUB_MEMBERSHIP] }
        })
      ])

      const event = await client.event.create({
        ...generator.event.create(),
        createdAtLocation: locations[0].id
      })

      const db = getClient()
      const logs = await db
        .selectFrom('auditLog')
        .selectAll()
        .where('clientId', '=', systemId)
        .execute()

      expect(logs).toHaveLength(1)
      expect(logs[0].operation).toBe('event.create')
      expect(logs[0].clientType).toBe('system')
      expect(logs[0].responseSummary).toMatchObject({
        eventId: event.id,
        eventType: event.type,
        trackingId: event.trackingId
      })
    })
  })

  describe('event.get', () => {
    test('writes an audit log entry when a system client fetches an event', async () => {
      const { generator, locations } = await setupTestCase()
      const systemId = getUUID()

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
        eventId: event.id,
        eventType: event.type,
        trackingId: event.trackingId
      })
    })
  })

  describe('event.actions.notify', () => {
    test('writes an audit log entry when a system client notifies an event', async () => {
      const { generator } = await setupTestCase()
      const systemId = getUUID()
      const locations = await getLocations()

      const client = createSystemTestClient(systemId, [
        encodeScope({
          type: 'record.create',
          options: { event: [TENNIS_CLUB_MEMBERSHIP] }
        }),
        `record.notify[event=${TENNIS_CLUB_MEMBERSHIP}]`
      ])

      const event = await client.event.create({
        ...generator.event.create(),
        createdAtLocation: locations[0].id
      })

      const result = await client.event.actions.notify.request({
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
      expect(logs[0].responseSummary).toMatchObject({
        eventId: result.id,
        eventType: result.type,
        trackingId: result.trackingId
      })
    })
  })

  describe('event.search', () => {
    test('writes an audit log entry when a system client searches for events', async () => {
      const systemId = getUUID()
      const client = createSystemTestClient(systemId, [SCOPES.RECORDSEARCH])

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

    test('writes an audit log entry when a human user searches for events', async () => {
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

      const result = await client.event.search(searchInput)

      const db = getClient()
      const logs = await db
        .selectFrom('auditLog')
        .selectAll()
        .where('clientId', '=', user.id)
        .execute()

      expect(logs).toHaveLength(1)
      expect(logs[0].operation).toBe('event.search')
      expect(logs[0].clientType).toBe('user')
      expect(logs[0].responseSummary).toMatchObject({
        total: result.total,
        eventIds: result.results.map((r) => r.id)
      })
    })
  })

  describe('integrations.create', () => {
    test('writes an audit log entry when a system client creates an integration', async () => {
      const systemId = getUUID()
      const client = createSystemTestClient(systemId, [
        SCOPES.INTEGRATION_CREATE
      ])

      mswServer.use(
        http.post(`${env.USER_MANAGEMENT_URL}/registerSystem`, () =>
          HttpResponse.json({
            system: {
              clientId: 'new-client-id',
              shaSecret: 'sha-secret'
            },
            clientSecret: 'client-secret'
          })
        )
      )

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
      const systemId = getUUID()
      const client = createSystemTestClient(systemId, [
        SCOPES.INTEGRATION_CREATE
      ])

      mswServer.use(
        http.post(`${env.USER_MANAGEMENT_URL}/registerSystem`, () =>
          HttpResponse.json({
            system: {
              clientId: 'new-client-id',
              shaSecret: 'sha-secret'
            },
            clientSecret: 'client-secret'
          })
        )
      )

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
      const systemId = getUUID()
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

  describe('integrations.audit', () => {
    test('returns paginated audit log entries for a specific client', async () => {
      const adminId = getUUID()
      const targetClientId = getUUID()
      const adminClient = createSystemTestClient(adminId, [SCOPES.AUDIT_READ])

      const db = getClient()
      await db
        .insertInto('auditLog')
        .values([
          {
            clientId: targetClientId,
            clientType: 'system',
            operation: 'event.create',
            requestData: {
              transactionId: 'tx1',
              type: 'birth',
              createdAtLocation: null
            },
            responseSummary: {
              eventId: 'evt1',
              eventType: 'birth',
              trackingId: 'TR1'
            },
            createdAt: '2024-01-01T10:00:00Z'
          },
          {
            clientId: targetClientId,
            clientType: 'system',
            operation: 'event.get',
            requestData: { eventId: 'evt1' },
            responseSummary: {
              eventId: 'evt1',
              eventType: 'birth',
              trackingId: 'TR1'
            },
            createdAt: '2024-01-02T10:00:00Z'
          }
        ])
        .execute()

      const result = await adminClient.integrations.audit({
        clientId: targetClientId,
        skip: 0,
        count: 10
      })

      expect(result.total).toBe(2)
      expect(result.results).toHaveLength(2)
      expect(result.results[0].operation).toBe('event.get')
      expect(result.results[1].operation).toBe('event.create')
    })

    test('filters audit log entries by date range', async () => {
      const adminId = getUUID()
      const targetClientId = getUUID()
      const adminClient = createSystemTestClient(adminId, [SCOPES.AUDIT_READ])

      const db = getClient()
      await db
        .insertInto('auditLog')
        .values([
          {
            clientId: targetClientId,
            clientType: 'system',
            operation: 'event.create',
            requestData: null,
            responseSummary: null,
            createdAt: '2024-01-01T10:00:00Z'
          },
          {
            clientId: targetClientId,
            clientType: 'system',
            operation: 'event.get',
            requestData: null,
            responseSummary: null,
            createdAt: '2024-06-15T10:00:00Z'
          },
          {
            clientId: targetClientId,
            clientType: 'system',
            operation: 'event.search',
            requestData: null,
            responseSummary: null,
            createdAt: '2024-12-31T10:00:00Z'
          }
        ])
        .execute()

      const result = await adminClient.integrations.audit({
        clientId: targetClientId,
        from: '2024-01-15T00:00:00Z',
        to: '2024-12-01T00:00:00Z'
      })

      expect(result.total).toBe(1)
      expect(result.results[0].operation).toBe('event.get')
    })

    test('rejects access without audit.read scope', async () => {
      const unauthorizedId = getUUID()
      const targetClientId = getUUID()
      const unauthorizedClient = createSystemTestClient(unauthorizedId, [
        SCOPES.INTEGRATION_CREATE
      ])

      await expect(
        unauthorizedClient.integrations.audit({
          clientId: targetClientId
        })
      ).rejects.toThrow()
    })
  })
})
