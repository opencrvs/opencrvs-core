import { expect, test } from '@playwright/test'
import { createIntegrationContext, EVENT_TYPE, fetchClientAPI } from './helpers'

test.describe('POST /api/events/events/search', () => {
  let clientToken: string

  test.beforeAll(async () => {
    const context = await createIntegrationContext()
    clientToken = context.clientToken
  })

  test('HTTP 200 with search results', async () => {
    const response = await fetchClientAPI(
      '/api/events/events/search',
      'POST',
      clientToken,
      {
        query: {
          type: 'and',
          clauses: [
            {
              eventType: EVENT_TYPE
            }
          ]
        },
        limit: 5,
        offset: 0
      }
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('results')
    expect(Array.isArray(body.results)).toBe(true)
  })
})
