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

vi.mock('node-fetch', () => {
  return {
    default: vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => 'mock-public-key'
    })
  }
})

const locationGetMock = vi.hoisted(() => vi.fn())

vi.mock('@opencrvs/toolkit/api', () => ({
  createClient: vi.fn(() => ({
    locations: {
      get: {
        query: locationGetMock
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
const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'mocked-id' })
vi.mock('nodemailer', () => {
  return {
    createTransport: vi.fn(() => ({
      sendMail: sendMailMock
    }))
  }
})

import { createServer } from '../../index'

import { informantNotificationTestData } from './testData'

const OFFICE_ID = '9e069dda-0d83-4f67-a4f2-9adbf5658e2e'
const OFFICE_NAME = 'Windmill village registrar office'

describe('Informant notification - Email', () => {
  let server: any

  beforeEach(async () => {
    vi.resetModules()
    sendMailMock.mockClear()
    locationGetMock.mockReset()
    locationGetMock.mockResolvedValue({
      id: OFFICE_ID,
      name: OFFICE_NAME
    })
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

        expect(sendMailMock).toHaveBeenCalledTimes(1)
        expect(sendMailMock.mock.calls[0][0]).toMatchSnapshot()
      })
  )

  const [{ eventType, actionType, eventDocument }] =
    informantNotificationTestData

  function trigger(payload: unknown) {
    return server.server.inject({
      method: 'POST',
      url: `/trigger/events/${eventType}/actions/${actionType}`,
      payload,
      auth: {
        strategy: 'jwt',
        credentials: {},
        artifacts: { token: 'mock-token' }
      }
    })
  }

  it('notifies with an empty office name when the office lookup fails', async () => {
    locationGetMock.mockRejectedValue(new Error('Location not found'))

    await trigger(eventDocument)

    expect(sendMailMock).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(sendMailMock.mock.calls[0][0])).not.toContain(
      OFFICE_NAME
    )
  })

  it('skips the office lookup when the action has no location', async () => {
    await trigger({
      ...eventDocument,
      actions: eventDocument.actions.map((action) => ({
        ...action,
        createdAtLocation: null
      }))
    })

    expect(locationGetMock).not.toHaveBeenCalled()
    expect(sendMailMock).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(sendMailMock.mock.calls[0][0])).not.toContain(
      OFFICE_NAME
    )
  })
})
