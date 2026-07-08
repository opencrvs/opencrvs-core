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
      USER_NOTIFICATION_DELIVERY_METHOD: 'sms'
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

import fetch from 'node-fetch'
import { userNotificationTestData } from './testData'
import { createServer } from '../../index'

describe('User notification - sms', () => {
  let server: any

  beforeEach(async () => {
    ;(fetch as any).mockClear()
    server = await createServer()
  })

  userNotificationTestData.forEach(({ event, payload }) =>
    it(event, async () => {
      await server.server
        .inject({
          method: 'POST',
          url: `/triggers/user/${event}`,
          payload
        })
        .catch(() => {})
      expect((fetch as any).mock.calls[1][1].body).toMatchSnapshot()
    })
  )
})
