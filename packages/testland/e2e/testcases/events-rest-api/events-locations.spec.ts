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
  createIntegrationContext,
  fetchClientAPI,
  NON_EXISTING_UUID
} from '@e2e/support/events-rest-api/helpers'

test.describe('GET /api/events/locations', () => {
  let clientToken: string

  test.beforeAll(async () => {
    const context = await createIntegrationContext()
    clientToken = context.clientToken
  })

  test('HTTP 200 with locations payload', async () => {
    const response = await fetchClientAPI(
      '/api/events/locations',
      'GET',
      clientToken
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
  })
})

test.describe('Location write API (/api/events/locations)', () => {
  let systemAdminToken: string
  let registrarToken: string

  test.beforeAll(async () => {
    systemAdminToken = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    registrarToken = await getToken(CREDENTIALS.REGISTRAR)
  })

  function locationPayload(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      id: uuidv4(),
      name: `E2E Office ${uuidv4()}`,
      externalId: `e2e-pcode-${uuidv4()}`,
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE',
      ...overrides
    }
  }

  test.describe('POST /api/events/locations', () => {
    test('HTTP 401 when invalid token is used', async () => {
      const response = await fetchClientAPI(
        '/api/events/locations',
        'POST',
        'foobar',
        locationPayload()
      )
      expect(response.status).toBe(401)
    })

    test('HTTP 403 when user is missing the location.edit scope', async () => {
      const response = await fetchClientAPI(
        '/api/events/locations',
        'POST',
        registrarToken,
        locationPayload()
      )
      expect(response.status).toBe(403)
    })

    test('HTTP 400 with invalid payload', async () => {
      const response = await fetchClientAPI(
        '/api/events/locations',
        'POST',
        systemAdminToken,
        { name: 'Missing required fields' }
      )
      expect(response.status).toBe(400)
    })

    test('HTTP 200 with valid payload — stores a single active initial version', async () => {
      const payload = locationPayload({ name: 'Create Happy Path Office' })

      const response = await fetchClientAPI(
        '/api/events/locations',
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

    test('an identical replay returns the existing location, not a duplicate', async () => {
      const payload = locationPayload({ name: 'Replayed Office' })

      const first = await fetchClientAPI(
        '/api/events/locations',
        'POST',
        systemAdminToken,
        payload
      )
      const second = await fetchClientAPI(
        '/api/events/locations',
        'POST',
        systemAdminToken,
        payload
      )

      expect(first.status).toBe(200)
      expect(second.status).toBe(200)
      expect(await first.json()).toEqual(await second.json())
    })

    test('HTTP 409 when the same id is replayed with different values', async () => {
      const payload = locationPayload({ name: 'Original Name' })

      await fetchClientAPI(
        '/api/events/locations',
        'POST',
        systemAdminToken,
        payload
      )

      const response = await fetchClientAPI(
        '/api/events/locations',
        'POST',
        systemAdminToken,
        { ...payload, name: 'Different Name' }
      )

      expect(response.status).toBe(409)
    })

    test('HTTP 409 when externalId is already held by an active location', async () => {
      const externalId = `e2e-duplicate-pcode-${uuidv4()}`

      await fetchClientAPI(
        '/api/events/locations',
        'POST',
        systemAdminToken,
        locationPayload({ name: 'First Office', externalId })
      )

      const response = await fetchClientAPI(
        '/api/events/locations',
        'POST',
        systemAdminToken,
        locationPayload({ name: 'Second Office', externalId })
      )

      expect(response.status).toBe(409)
    })
  })

  test.describe('PUT /api/events/locations/{id}', () => {
    async function createLocation() {
      const payload = locationPayload()
      const response = await fetchClientAPI(
        '/api/events/locations',
        'POST',
        systemAdminToken,
        payload
      )
      return response.json()
    }

    test('HTTP 200 appends a rename version', async () => {
      const created = await createLocation()

      const response = await fetchClientAPI(
        `/api/events/locations/${created.id}`,
        'PUT',
        systemAdminToken,
        {
          name: 'Renamed Office',
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
        name: 'Renamed Office',
        effectiveFrom: '2099-01-01'
      })
    })

    test('HTTP 409 when lastVersionId is stale', async () => {
      const created = await createLocation()

      await fetchClientAPI(
        `/api/events/locations/${created.id}`,
        'PUT',
        systemAdminToken,
        {
          name: 'First Update',
          externalId: created.externalId,
          status: 'active',
          effectiveFrom: '2099-01-01',
          lastVersionId: created.versions[0].versionId
        }
      )

      const response = await fetchClientAPI(
        `/api/events/locations/${created.id}`,
        'PUT',
        systemAdminToken,
        {
          name: 'Second Update',
          externalId: created.externalId,
          status: 'active',
          effectiveFrom: '2099-06-01',
          // Same (now stale) token as the first update.
          lastVersionId: created.versions[0].versionId
        }
      )

      expect(response.status).toBe(409)
    })

    test('HTTP 422 when effectiveFrom is not later than the latest version', async () => {
      const created = await createLocation()

      // Move the latest version to 2025-01-01, then attempt a splice into the
      // past at a date that does not collide with any existing element
      // (0001-01-01 or 2025-01-01) but is not later than the latest — 422,
      // not 409.
      const renamed = await (
        await fetchClientAPI(
          `/api/events/locations/${created.id}`,
          'PUT',
          systemAdminToken,
          {
            name: created.name,
            externalId: created.externalId,
            status: 'active',
            effectiveFrom: '2025-01-01',
            lastVersionId: created.versions[0].versionId
          }
        )
      ).json()

      const response = await fetchClientAPI(
        `/api/events/locations/${created.id}`,
        'PUT',
        systemAdminToken,
        {
          name: 'Past Splice',
          externalId: created.externalId,
          status: 'active',
          effectiveFrom: '2020-01-01',
          lastVersionId: renamed.versions[1].versionId
        }
      )

      expect(response.status).toBe(422)
    })

    test('HTTP 404 for an unknown location id', async () => {
      const response = await fetchClientAPI(
        `/api/events/locations/${NON_EXISTING_UUID}`,
        'PUT',
        systemAdminToken,
        {
          name: 'Ghost Office',
          externalId: null,
          status: 'active',
          lastVersionId: uuidv4()
        }
      )

      expect(response.status).toBe(404)
    })
  })

  test.describe('DELETE /api/events/locations/{id}/versions/{versionId}', () => {
    async function createLocationWithPendingVersion() {
      const created = await (
        await fetchClientAPI(
          '/api/events/locations',
          'POST',
          systemAdminToken,
          locationPayload()
        )
      ).json()

      const updated = await (
        await fetchClientAPI(
          `/api/events/locations/${created.id}`,
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

      return { created, pendingVersionId: updated.versions[1].versionId }
    }

    test('HTTP 200 withdraws a pending future version', async () => {
      const { created, pendingVersionId } =
        await createLocationWithPendingVersion()

      const response = await fetchClientAPI(
        `/api/events/locations/${created.id}/versions/${pendingVersionId}`,
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
          '/api/events/locations',
          'POST',
          systemAdminToken,
          locationPayload()
        )
      ).json()

      const response = await fetchClientAPI(
        `/api/events/locations/${created.id}/versions/${created.versions[0].versionId}`,
        'DELETE',
        systemAdminToken
      )

      expect(response.status).toBe(409)
    })

    test('HTTP 404 for an unknown location id', async () => {
      const response = await fetchClientAPI(
        `/api/events/locations/${NON_EXISTING_UUID}/versions/${uuidv4()}`,
        'DELETE',
        systemAdminToken
      )

      expect(response.status).toBe(404)
    })
  })
})
