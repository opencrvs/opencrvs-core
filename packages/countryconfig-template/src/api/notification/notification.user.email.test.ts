import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('node-fetch', () => {
  return {
    default: vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => 'mock-public-key'
    })
  }
})

const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'mocked-id' })
vi.mock('nodemailer', () => {
  return {
    createTransport: vi.fn(() => ({
      sendMail: sendMailMock
    }))
  }
})

import { createServer } from '../../index'

import { userNotificationTestData } from './testData'

describe('User notification - Email', () => {
  let server: any

  beforeEach(async () => {
    vi.resetModules()
    sendMailMock.mockClear()
    server = await createServer()
  })

  userNotificationTestData.forEach(({ event, payload }) =>
    it(event, async () => {
      await server.server.inject({
        method: 'POST',
        url: `/triggers/user/${event}`,
        payload
      })
      expect(sendMailMock).toHaveBeenCalledTimes(1)
      expect(sendMailMock.mock.calls[0][0]).toMatchSnapshot()
    })
  )
})
