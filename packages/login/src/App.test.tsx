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
import { createTestApp } from '@login/tests/util'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { act } from 'react'

describe('Login app step one', () => {
  let app: any
  beforeEach(async () => {
    const appBundle = await createTestApp()
    app = appBundle.app
    window.config = {
      COUNTRY: 'far',
      LANGUAGES: ['en', 'fr'],
      USER_NOTIFICATION_DELIVERY_METHOD: 'sms',
      PHONE_NUMBER_PATTERN: /^0(7|9)[0-9]{1}[0-9]{7}$/,
      SENTRY: 'https://f892d643aab642108f44e2d1795706bc@sentry.io/1774604',
      LOGIN_BACKGROUND: {
        backgroundColor: '#000000'
      },
      INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'sms'
    }
  })

  afterEach(() => {
    app.unmount()
  })

  it('renders a phone number and a password field on startup', async () => {
    expect(app.find('input')).toHaveLength(3)
  })

  it('fills credentials form', async () => {
    const { app } = await createTestApp()
    app
      .find('input#username')
      .simulate('change', { target: { value: 'kennedy.mweene' } })

    app.find('input#password').simulate('change', { target: { value: 'test' } })
  })
})

describe('Login error', () => {
  it('shows rate limit error', async () => {
    const server = setupServer(
      rest.post('/api/auth/authenticate', (_, res, ctx) => {
        return res(
          ctx.status(429),
          ctx.json({
            statusCode: 429,
            error: 'RATE_LIMIT_ERROR',
            message: 'Rate limited'
          })
        )
      })
    )
    server.listen()

    try {
      const { app } = await createTestApp()

      app
        .find('input#username')
        .simulate('change', { target: { value: 'kennedy.mweene' } })
      app
        .find('input#password')
        .simulate('change', { target: { value: 'test' } })

      await act(async () => {
        app.find('form#STEP_ONE').simulate('submit')
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
      app.update()

      const toast = app.findWhere(
        (node) =>
          node.type() !== undefined &&
          node
            .text()
            .includes(
              'Too many login attempts. You can try again after one minute.'
            )
      )
      expect(toast.exists()).toBe(true)
    } finally {
      server.close()
    }
  })
})
