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

vi.mock('./notification/constant', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('./notification/constant')>()
  return {
    ...actual,
    INFOBIP_API_KEY: 'mock_api_key',
    INFOBIP_GATEWAY_ENDPOINT: 'https://gateway.infobip.com',
    INFOBIP_SENDER_ID: 'mock_sender'
  }
})

vi.mock('./application/application-config', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('./application/application-config')>()
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
import { SERVICE_USER_ID } from '@opencrvs/toolkit/authentication'
import {
  informantNotificationTestData,
  userNotificationTestData
} from './notification/testData'
import { createServer } from '../index'

const [{ eventType, actionType, eventDocument }] = informantNotificationTestData
const confirmationUrl = `/trigger/events/${eventType}/actions/${actionType}`

/*
 * A token a logged-in registrar could hold. It authenticates fine, it just did
 * not come from core, which is what the guard is there to tell apart.
 */
const registrarCredentials = {
  sub: '3fb1d1ed-63c5-4d3f-bb9f-7ca44d09e70a',
  scope: ['record.register']
}

describe('Action confirmation requests are only accepted from core', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
    // Clear the calls made while the server was starting up.
    ;(fetch as any).mockClear()
  })

  it('rejects a confirmation request carrying a token other than the service token', async () => {
    const response = await server.server.inject({
      method: 'POST',
      url: confirmationUrl,
      payload: eventDocument,
      auth: {
        strategy: 'jwt',
        credentials: registrarCredentials,
        artifacts: { token: 'mock-token' }
      }
    })

    expect(response.statusCode).toBe(403)
    expect(response.result).toEqual({ error: 'forbidden' })
    // The handler never ran, so no informant was notified.
    expect(fetch as any).not.toHaveBeenCalled()
  })

  it('lets the same request through when it carries the service token', async () => {
    const response = await server.server.inject({
      method: 'POST',
      url: confirmationUrl,
      payload: eventDocument,
      auth: {
        strategy: 'jwt',
        credentials: { sub: SERVICE_USER_ID },
        artifacts: { token: 'mock-token' }
      }
    })

    expect(response.statusCode).not.toBe(403)
    expect(fetch as any).toHaveBeenCalled()
  })

  it('leaves routes other than action confirmation to their own authorization', async () => {
    const [{ event, payload }] = userNotificationTestData

    const response = await server.server.inject({
      method: 'POST',
      url: `/trigger/user/${event}`,
      payload,
      auth: {
        strategy: 'jwt',
        credentials: registrarCredentials,
        artifacts: { token: 'mock-token' }
      }
    })

    expect(response.statusCode).not.toBe(403)
  })
})
