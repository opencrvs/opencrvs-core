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
import { expect, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { getToken } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  fetchClientAPI,
  NON_EXISTING_UUID
} from '@e2e/support/events-rest-api/helpers'

// The rest of the create/update/withdraw invariants (idempotency, forward-only
// effectiveFrom, stale lastVersionId, externalId uniqueness) are shared code
// with locations — see events-locations.spec.ts for the full matrix. This
// file covers the administrative-area-specific wiring: parentId instead of
// administrativeAreaId/locationType, and one representative case per verb.

test.describe('GET /api/events/administrative-areas', () => {
  let systemAdminToken: string

  test.beforeAll(async () => {
    systemAdminToken = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
  })

  test('HTTP 200 with administrative areas payload', async () => {
    const response = await fetchClientAPI(
      '/api/events/administrative-areas',
      'GET',
      systemAdminToken
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
  })
})

test.describe('Administrative area write API (/api/events/administrative-areas)', () => {
  let systemAdminToken: string
  let registrarToken: string

  test.beforeAll(async () => {
    systemAdminToken = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    registrarToken = await getToken(CREDENTIALS.REGISTRAR)
  })

  function areaPayload(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      id: uuidv4(),
      name: `E2E District ${uuidv4()}`,
      externalId: `e2e-area-pcode-${uuidv4()}`,
      parentId: null,
      ...overrides
    }
  }

  test.describe('POST /api/events/administrative-areas', () => {
    test('HTTP 403 when user is missing the location.edit scope', async () => {
      const response = await fetchClientAPI(
        '/api/events/administrative-areas',
        'POST',
        registrarToken,
        areaPayload()
      )
      expect(response.status).toBe(403)
    })

    test('HTTP 200 with valid payload — stores a single active initial version', async () => {
      const payload = areaPayload({ name: 'Create Happy Path District' })

      const response = await fetchClientAPI(
        '/api/events/administrative-areas',
        'POST',
        systemAdminToken,
        payload
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toMatchObject({
        id: payload.id,
        name: payload.name,
        externalId: payload.externalId,
        parentId: null,
        status: 'active'
      })
      expect(body.versions).toEqual([
        expect.objectContaining({
          effectiveFrom: '0001-01-01',
          name: payload.name,
          status: 'active'
        })
      ])
    })

    test('HTTP 409 when externalId is already held by an active administrative area', async () => {
      const externalId = `e2e-duplicate-area-pcode-${uuidv4()}`

      await fetchClientAPI(
        '/api/events/administrative-areas',
        'POST',
        systemAdminToken,
        areaPayload({ name: 'First District', externalId })
      )

      const response = await fetchClientAPI(
        '/api/events/administrative-areas',
        'POST',
        systemAdminToken,
        areaPayload({ name: 'Second District', externalId })
      )

      expect(response.status).toBe(409)
    })
  })

  test.describe('PUT /api/events/administrative-areas/{id}', () => {
    async function createArea() {
      const payload = areaPayload()
      const response = await fetchClientAPI(
        '/api/events/administrative-areas',
        'POST',
        systemAdminToken,
        payload
      )
      return response.json()
    }

    test('HTTP 200 appends a rename version', async () => {
      const created = await createArea()

      const response = await fetchClientAPI(
        `/api/events/administrative-areas/${created.id}`,
        'PUT',
        systemAdminToken,
        {
          name: 'Renamed District',
          externalId: created.externalId,
          status: 'active',
          effectiveFrom: '2099-01-01',
          lastVersionId: created.versions[0].versionId
        }
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.versions).toHaveLength(2)
      expect(body.versions[1]).toMatchObject({
        name: 'Renamed District',
        effectiveFrom: '2099-01-01'
      })
    })

    test('HTTP 400 when the payload carries the immutable parentId', async () => {
      const created = await createArea()

      const response = await fetchClientAPI(
        `/api/events/administrative-areas/${created.id}`,
        'PUT',
        systemAdminToken,
        {
          name: 'Attempted Reparent',
          externalId: created.externalId,
          status: 'active',
          lastVersionId: created.versions[0].versionId,
          parentId: NON_EXISTING_UUID
        }
      )

      expect(response.status).toBe(400)
    })
  })

  test.describe('DELETE /api/events/administrative-areas/{id}/versions/{versionId}', () => {
    test('HTTP 200 withdraws a pending future version', async () => {
      const created = await (
        await fetchClientAPI(
          '/api/events/administrative-areas',
          'POST',
          systemAdminToken,
          areaPayload()
        )
      ).json()

      const updated = await (
        await fetchClientAPI(
          `/api/events/administrative-areas/${created.id}`,
          'PUT',
          systemAdminToken,
          {
            name: created.name,
            externalId: created.externalId,
            status: 'active',
            effectiveFrom: '2099-01-01',
            lastVersionId: created.versions[0].versionId
          }
        )
      ).json()

      const response = await fetchClientAPI(
        `/api/events/administrative-areas/${created.id}/versions/${updated.versions[1].versionId}`,
        'DELETE',
        systemAdminToken
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.versions).toHaveLength(1)
    })

    test('HTTP 409 when the version is already in effect', async () => {
      const created = await (
        await fetchClientAPI(
          '/api/events/administrative-areas',
          'POST',
          systemAdminToken,
          areaPayload()
        )
      ).json()

      const response = await fetchClientAPI(
        `/api/events/administrative-areas/${created.id}/versions/${created.versions[0].versionId}`,
        'DELETE',
        systemAdminToken
      )

      expect(response.status).toBe(409)
    })
  })
})
