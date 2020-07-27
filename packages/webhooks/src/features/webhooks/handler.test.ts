/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { createServer } from '@webhooks/index'
import Webhook, { IWebhook } from '@webhooks/model/webhook'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import mockingoose from 'mockingoose'

const fetch = fetchMock as fetchMock.FetchMock

const token = jwt.sign(
  { scope: ['sysadmin', 'demo'] },
  readFileSync('../auth/test/cert.key'),
  {
    subject: '123',
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:webhooks-user'
  }
)

const mockActiveSystem = {
  name: 'John William',
  username: 'j.doe1',
  client_id: '123',
  status: 'active'
}

const mockInactiveSystem = {
  name: 'John William',
  username: 'j.doe1',
  client_id: '123',
  status: 'deactivated'
}

const mockWebhook = ({
  webhookId: '123',
  createdBy: {
    client_id: '123',
    name: 'John William',
    type: 'api',
    username: 'j.doe1'
  },
  address: 'https://www.your-great-domain.com/webhooks',
  trigger: 'BIRTH_REGISTERED'
} as unknown) as IWebhook

const mockWebhooks = [
  {
    webhookId: '123',
    createdBy: {
      client_id: '123',
      name: 'John William',
      type: 'api',
      username: 'j.doe1'
    },
    address: 'https://www.your-great-domain.com/webhooks',
    trigger: 'BIRTH_REGISTERED'
  } as unknown,
  {
    webhookId: '456',
    createdBy: {
      client_id: '123',
      name: 'John William',
      type: 'api',
      username: 'j.doe1'
    },
    address: 'https://www.your-great-domain.com/webhooks',
    trigger: 'DEATH_CERTIFIED'
  } as unknown
] as IWebhook[]

describe('subscribeWebhooksHandler handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('creates and saves a webhook using mongoose', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockActiveSystem))
    mockingoose(Webhook).toReturn(mockWebhook, 'save')

    const res = await server.server.inject({
      method: 'POST',
      url: '/webhooks',
      payload: {
        address: 'https://www.your-great-domain.com/webhooks',
        trigger: 'BIRTH_REGISTERED'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('return unauthoried error if system not active', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockInactiveSystem))

    const res = await server.server.inject({
      method: 'POST',
      url: '/webhooks',
      payload: {
        address: 'https://www.your-great-domain.com/webhooks',
        trigger: 'BIRTH_REGISTERED'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.result).toEqual(
      'Active system details cannot be found.  This client is no longer enabled'
    )
    expect(res.statusCode).toBe(400)
  })

  it('return an error if a trigger is unsupported', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/webhooks',
      payload: {
        address: 'https://www.your-great-domain.com/webhooks',
        trigger: '123'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.result).toEqual('Unsupported trigger: 123')
    expect(res.statusCode).toBe(400)
  })
})

describe('listWebhooksHandler handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('lists all webhooks for this client', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockActiveSystem))
    mockingoose(Webhook).toReturn(mockWebhooks, 'find')

    const res = await server.server.inject({
      method: 'GET',
      url: '/webhooks',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('return unauthoried error if system not active', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockInactiveSystem))

    const res = await server.server.inject({
      method: 'GET',
      url: '/webhooks',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.result).toEqual(
      'Active system details cannot be found.  This client is no longer enabled'
    )
    expect(res.statusCode).toBe(400)
  })
})
