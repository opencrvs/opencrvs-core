import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock(import('./constant'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    INFOBIP_API_KEY: 'mock_api_key',
    INFOBIP_GATEWAY_ENDPOINT: 'https://gateway.infobip.com',
    INFOBIP_SENDER_ID: 'mock_sender'
  }
})

vi.mock(import('../application/application-config'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    applicationConfig: {
      ...actual.applicationConfig,
      INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'sms'
    }
  }
})

vi.mock('node-fetch', () => {
  return {
    default: vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => 'mock-public-key'
    })
  }
})

vi.mock('@opencrvs/toolkit/api', () => ({
  createClient: vi.fn(() => ({
    locations: {
      list: {
        query: vi.fn().mockResolvedValue([
          {
            id: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e',
            name: 'Windmill village registrar office'
          }
        ])
      }
    }
  }))
}))

vi.mock('nanoid', () => {
  return {
    customAlphabet: vi.fn(() => {
      return vi.fn(() => 'P4JPMNEW3ZM3')
    })
  }
})

import fetch from 'node-fetch'
import { informantNotificationTestData } from './testData'
import { createServer } from '../../index'

describe('User notification - sms', () => {
  let server: any

  beforeEach(async () => {
    ;(fetch as any).mockClear()
    server = await createServer()
  })

  informantNotificationTestData.forEach(
    ({ eventType, actionType, eventDocument }) =>
      it(`${eventType} - ${actionType}`, async () => {
        await server.server.inject({
          method: 'POST',
          url: `/trigger/events/${eventType}/actions/${actionType}`,
          payload: eventDocument,
          auth: {
            strategy: 'jwt',
            credentials: {},
            artifacts: { token: 'mock-token' }
          }
        })
        expect((fetch as any).mock.calls[1][1].body).toMatchSnapshot()
      })
  )
})
