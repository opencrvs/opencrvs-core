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

import { Server } from '@hapi/hapi'
import * as Boom from '@hapi/boom'
import { ErrorLoggerPlugin } from './error-logger'
import { logger } from '../logger'

describe('ErrorLoggerPlugin', () => {
  let server: Server

  beforeEach(async () => {
    server = new Server()
    await server.register({
      plugin: ErrorLoggerPlugin,
      options: { level: 'error' }
    })

    server.route({
      method: 'GET',
      path: '/error',
      handler: () => {
        throw Boom.badRequest('Boom test error')
      }
    })

    server.route({
      method: 'GET',
      path: '/ok',
      handler: () => 'all good'
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('logs Boom errors using the correct log level', async () => {
    const logSpy = jest.spyOn(logger, 'error').mockImplementation(() => {})

    const res = await server.inject({ method: 'GET', url: '/error' })

    expect(res.statusCode).toBe(400)
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        err: expect.any(Boom.Boom),
        url: '/error',
        method: 'get',
        statusCode: 400,
        tags: ['unhandled-error'],
        message: 'Boom test error'
      })
    )
  })

  it('does not log anything on successful response', async () => {
    const logSpy = jest.spyOn(logger, 'error').mockImplementation(() => {})

    const res = await server.inject({ method: 'GET', url: '/ok' })

    expect(res.statusCode).toBe(200)
    expect(logSpy).not.toHaveBeenCalled()
  })
})
