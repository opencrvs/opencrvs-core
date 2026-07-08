import { expect, test } from '@playwright/test'
import { createIntegrationContext, fetchClientAPI } from './helpers'

test.describe('GET /api/events/config', () => {
  let clientToken: string

  test.beforeAll(async () => {
    const context = await createIntegrationContext()
    clientToken = context.clientToken
  })

  test('HTTP 200 with config payload', async () => {
    const response = await fetchClientAPI(
      '/api/events/config',
      'GET',
      clientToken
    )

    expect(response.status).toBe(200)
    const body = await response.json()

    if (Array.isArray(body)) {
      expect(body.length).toBeGreaterThan(0)
      expect(body[0]).toHaveProperty('id')
    } else {
      expect(body).toHaveProperty('id')
    }
  })
})
