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
import {
  informantNotificationTestData,
  userNotificationTestData
} from './notification/testData'
import { createServer } from '../index'
import { coreKey, publishCoreKey } from '../tests/core-request'

const [{ eventType, actionType, eventDocument }] = informantNotificationTestData
const confirmationUrl = `/trigger/events/${eventType}/actions/${actionType}`

/*
 * What a logged-in registrar could send. Its token may be valid, it just did
 * not come from core, which is what `auth: 'core'` is there to tell apart.
 */
const registrarAuthorization = 'Bearer registrar.access.token'

describe('Requests that only core may send', () => {
  let server: any

  beforeEach(async () => {
    publishCoreKey()
    server = await createServer()
    // Clear the calls made while the server was starting up.
    ;(fetch as any).mockClear()
  })

  it('accepts an action confirmation that core signed', async () => {
    const response = await server.server.inject(
      coreKey.request('POST', confirmationUrl, eventDocument)
    )

    expect(response.statusCode).not.toBe(403)
    expect(fetch as any).toHaveBeenCalled()
  })

  it('rejects an action confirmation whose body was changed after signing', async () => {
    const response = await server.server.inject({
      ...coreKey.request('POST', confirmationUrl, eventDocument),
      payload: JSON.stringify({ ...eventDocument, id: 'another-event' })
    })

    expect(response.statusCode).toBe(403)
    expect(fetch as any).not.toHaveBeenCalled()
  })

  const [userNotification] = userNotificationTestData
  it.each([
    ['POST', confirmationUrl, eventDocument],
    [
      'POST',
      `/trigger/user/${userNotification.event}`,
      userNotification.payload
    ],
    ['GET', '/config/events', undefined],
    ['GET', '/config/roles', undefined],
    ['GET', '/config/users', undefined],
    ['GET', '/certificates', undefined]
  ])('rejects %s %s from a registrar', async (method, url, payload) => {
    const response = await server.server.inject({
      method,
      url,
      payload,
      headers: { Authorization: registrarAuthorization }
    })

    expect(response.statusCode).toBe(403)
    // The handler never ran, so it did not call out.
    expect(fetch as any).not.toHaveBeenCalled()
  })

  it.each([
    '/config/events',
    '/config/roles',
    '/config/users',
    '/certificates'
  ])('serves %s to core', async (url) => {
    const response = await server.server.inject(coreKey.request('GET', url))

    expect(response.statusCode).toBe(200)
  })
})
