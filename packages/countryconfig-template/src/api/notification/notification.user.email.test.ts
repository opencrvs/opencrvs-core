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
        url: `/trigger/user/${event}`,
        payload,
        auth: { strategy: 'jwt', credentials: {} }
      })
      expect(sendMailMock).toHaveBeenCalledTimes(1)
      expect(sendMailMock.mock.calls[0][0]).toMatchSnapshot()
    })
  )
})
