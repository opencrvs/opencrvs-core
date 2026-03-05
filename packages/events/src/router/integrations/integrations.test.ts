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

import { getUUID, SCOPES, UUID } from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import { createSystemTestClient } from '@events/tests/utils'

const SYSTEM_ID = getUUID()

describe('integrations', () => {
  describe('integrations.create', () => {
    test('creates a system client and returns credentials', async () => {
      const systemId = SYSTEM_ID
      const client = createSystemTestClient(systemId, [
        SCOPES.INTEGRATION_CREATE
      ])

      const result = await client.integrations.create({
        name: 'My Test Integration',
        scopes: [SCOPES.RECORD_IMPORT]
      })

      expect(result).toHaveProperty('clientId')
      expect(result).toHaveProperty('shaSecret')
      expect(result).toHaveProperty('clientSecret')
      expect(typeof result.clientId).toBe('string')
      expect(typeof result.shaSecret).toBe('string')
      expect(typeof result.clientSecret).toBe('string')
    })

    test('inserts a row into system_clients table', async () => {
      const systemId = SYSTEM_ID
      const client = createSystemTestClient(systemId, [
        SCOPES.INTEGRATION_CREATE
      ])

      const result = await client.integrations.create({
        name: 'DB Check Integration',
        scopes: [SCOPES.RECORD_IMPORT]
      })

      const db = getClient()
      const rows = await db
        .selectFrom('systemClients')
        .selectAll()
        .where('id', '=', result.clientId as UUID)
        .execute()

      expect(rows).toHaveLength(1)
      expect(rows[0].name).toBe('DB Check Integration')
      expect(rows[0].scopes).toEqual([SCOPES.RECORD_IMPORT])
      expect(rows[0].status).toBe('active')
      expect(rows[0].secretHash).toBeTruthy()
      expect(rows[0].salt).toBeTruthy()
      expect(rows[0].shaSecret).toBeTruthy()
    })

    test('writes an audit log entry', async () => {
      const systemId = SYSTEM_ID
      const client = createSystemTestClient(systemId, [
        SCOPES.INTEGRATION_CREATE
      ])

      const result = await client.integrations.create({
        name: 'Audit Integration',
        scopes: [SCOPES.RECORD_IMPORT]
      })

      const db = getClient()
      const logs = await db
        .selectFrom('auditLog')
        .selectAll()
        .where('clientId', '=', systemId)
        .where('operation', '=', 'integrations.create')
        .execute()

      expect(logs).toHaveLength(1)
      expect(logs[0].requestData).toMatchObject({
        name: 'Audit Integration',
        scopes: [SCOPES.RECORD_IMPORT]
      })
      expect(logs[0].responseSummary).toMatchObject({
        clientId: result.clientId
      })
      // Credentials must not be in audit log
      expect(logs[0].responseSummary).not.toHaveProperty('shaSecret')
      expect(logs[0].responseSummary).not.toHaveProperty('clientSecret')
    })
  })

  describe('integrations.list', () => {
    test('returns empty array when no clients exist', async () => {
      const systemId = SYSTEM_ID
      const client = createSystemTestClient(systemId, [
        SCOPES.INTEGRATION_CREATE
      ])

      const result = await client.integrations.list()

      expect(result).toEqual([])
    })

    test('lists created integration clients', async () => {
      const systemId = SYSTEM_ID
      const client = createSystemTestClient(systemId, [
        SCOPES.INTEGRATION_CREATE
      ])

      await client.integrations.create({
        name: 'Integration A',
        scopes: [SCOPES.RECORD_IMPORT]
      })
      await client.integrations.create({
        name: 'Integration B',
        scopes: [SCOPES.RECORD_IMPORT]
      })

      const result = await client.integrations.list()

      expect(result).toHaveLength(2)
      expect(result.map((r) => r.name).sort()).toEqual([
        'Integration A',
        'Integration B'
      ])
      result.forEach((r) => {
        expect(r).toHaveProperty('id')
        expect(r).toHaveProperty('name')
        expect(r).toHaveProperty('scopes')
        expect(r).toHaveProperty('status')
        expect(r.status).toBe('active')
      })
    })

    test('filters by status', async () => {
      const systemId = SYSTEM_ID
      const client = createSystemTestClient(systemId, [
        SCOPES.INTEGRATION_CREATE
      ])

      await client.integrations.create({
        name: 'Active Integration',
        scopes: [SCOPES.RECORD_IMPORT]
      })

      // Manually set one to disabled to test filtering
      const created = await client.integrations.create({
        name: 'Disabled Integration',
        scopes: [SCOPES.RECORD_IMPORT]
      })

      const db = getClient()
      await db
        .updateTable('systemClients')
        .set({ status: 'disabled' })
        .where('id', '=', created.clientId as UUID)
        .execute()

      const activeOnly = await client.integrations.list({ status: 'active' })
      expect(activeOnly).toHaveLength(1)
      expect(activeOnly[0].name).toBe('Active Integration')

      const disabledOnly = await client.integrations.list({
        status: 'disabled'
      })
      expect(disabledOnly).toHaveLength(1)
      expect(disabledOnly[0].name).toBe('Disabled Integration')
    })
  })

  describe('integrations.authenticate', () => {
    test('authenticates a system client and returns system details', async () => {
      const systemId = SYSTEM_ID
      const client = createSystemTestClient(systemId, [
        SCOPES.INTEGRATION_CREATE
      ])

      const created = await client.integrations.create({
        name: 'Auth Integration',
        scopes: [SCOPES.RECORD_IMPORT]
      })

      const result = await client.integrations.authenticate({
        client_id: created.clientId as UUID,
        client_secret: created.clientSecret
      })

      expect(result.id).toBe(created.clientId)
      expect(result.status).toBe('active')
      expect(result.scope).toContain(SCOPES.RECORD_IMPORT)
    })
  })
})
