import { expect, test } from '@playwright/test'
import { createIntegrationContext, fetchClientAPI } from './helpers'

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
