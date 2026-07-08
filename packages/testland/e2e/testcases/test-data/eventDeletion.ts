import { test } from '@playwright/test'
import { getToken } from '../../helpers'
import { CREDENTIALS, GATEWAY_HOST } from '../../constants'
import { createClient } from '@opencrvs/toolkit/api'

async function deleteEvent(token: string, eventId: string) {
  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

  await client.event.delete.mutate({ eventId })
}

export function trackAndDeleteCreatedEvents() {
  const createdEventIds: string[] = []
  let token: string

  test.beforeEach(async ({ page }) => {
    token = await getToken(CREDENTIALS.REGISTRAR)

    page.on('response', async (response) => {
      if (
        response.status() === 200 &&
        response.url().includes('/api/events/event.create')
      ) {
        try {
          const resBody = await response.json()
          createdEventIds.push(resBody.result.data.json.id)
        } catch (e) {
          // Do nothing
        }
      }
    })
  })

  test.afterAll(async () => {
    await Promise.allSettled(
      createdEventIds.map((eventId) => deleteEvent(token, eventId))
    )
  })
}
