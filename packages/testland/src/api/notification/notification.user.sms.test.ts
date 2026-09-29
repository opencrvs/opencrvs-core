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
import { TriggerEvent } from '@opencrvs/toolkit/notification'

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
          url: `/trigger/user/${event}`,
          payload,
          auth: { strategy: 'jwt', credentials: {} }
        })
        .catch(() => {})
      expect((fetch as any).mock.calls[1][1].body).toMatchSnapshot()
    })
  )
})

describe('User notification - sms - recovery link URL escaping', () => {
  let server: any

  // Real base64 output: contains '+', '/' and '=' — all characters
  // Handlebars HTML-escapes when a double-stash `{{recoveryURL}}` is used.
  // SMS is plain text with no HTML parser to rescue it, so the escaped
  // string reaches the recipient's phone verbatim.
  const hostileToken = '+OeRSRPHXAPMLXZXvWXyFQ=='

  const recipient = {
    name: {
      firstname: 'John',
      surname: 'Doe'
    },
    email: 'john.doe@gmail.com',
    mobile: '+15551234567'
  }

  beforeEach(async () => {
    ;(fetch as any).mockClear()
    server = await createServer()
  })

  it.each([
    TriggerEvent.PASSWORD_RESET_LINK,
    TriggerEvent.USERNAME_REMINDER_LINK
  ])(
    '%s renders an sms body whose token round-trips through the URL intact',
    async (event) => {
      await server.server
        .inject({
          method: 'POST',
          url: `/trigger/user/${event}`,
          payload: {
            recipient,
            token: hostileToken
          },
          auth: { strategy: 'jwt', credentials: {} }
        })
        .catch(() => {})

      const requestBody = JSON.parse((fetch as any).mock.calls[1][1].body)
      const smsBody = requestBody.messages[0].text as string

      expect(smsBody).toContain('?token=')
      expect(smsBody).not.toContain('&#x3D;')
      expect(smsBody).not.toContain('&amp;')

      const urlMatch = smsBody.match(/https?:\/\/\S+/)
      expect(urlMatch).not.toBeNull()

      const url = new URL(urlMatch![0])
      expect(url.searchParams.get('token')).toBe(hostileToken)
    }
  )
})
