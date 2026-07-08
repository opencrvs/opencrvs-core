import { expect, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { createIntegrationContext, EVENT_TYPE, fetchClientAPI } from './helpers'

test.describe('POST /api/events/events', () => {
  let clientToken: string
  let systemAdminToken: string
  let healthFacilityId: string

  test.beforeAll(async () => {
    const context = await createIntegrationContext()
    clientToken = context.clientToken
    systemAdminToken = context.systemAdminToken
    healthFacilityId = context.healthFacilityId
  })

  test('HTTP 401 when invalid token is used', async () => {
    const response = await fetchClientAPI(
      '/api/events/events',
      'POST',
      'foobar'
    )
    expect(response.status).toBe(401)
  })

  test('HTTP 403 when user is missing scope', async () => {
    const response = await fetchClientAPI(
      '/api/events/events',
      'POST',
      systemAdminToken
    )

    expect(response.status).toBe(403)
  })

  test('HTTP 400 with missing payload', async () => {
    const response = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken
    )

    expect(response.status).toBe(400)
  })

  test('HTTP 400 without transaction id', async () => {
    const response = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: 'foobar'
      }
    )

    expect(response.status).toBe(400)
  })

  test('HTTP 400 when createdAtLocation is missing', async () => {
    const response = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId: uuidv4()
      }
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toBe(
      'createdAtLocation is required and must be a valid location id'
    )
  })

  test('HTTP 400 when createdAtLocation is invalid', async () => {
    const response = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId: uuidv4(),
        createdAtLocation: uuidv4()
      }
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toBe('createdAtLocation must be a valid location id')
  })

  test('HTTP 200 with valid payload', async () => {
    const response = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId: uuidv4(),
        createdAtLocation: healthFacilityId
      }
    )

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.type).toBe(EVENT_TYPE)
    expect(body.actions.length).toBe(1)
  })

  test('API is idempotent', async () => {
    const transactionId = uuidv4()
    const response1 = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId,
        createdAtLocation: healthFacilityId
      }
    )

    const response2 = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        createdAtLocation: healthFacilityId,
        transactionId
      }
    )

    const body1 = await response1.json()
    const body2 = await response2.json()

    expect(response1.status).toBe(200)
    expect(response2.status).toBe(200)
    expect(body1).toEqual(body2)
  })
})
