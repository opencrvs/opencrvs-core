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

import { Plugin } from '@hapi/hapi'
import { Boom } from '@hapi/boom'
import { logger } from '../logger'

type ErrorLoggerPluginOptions = {
  level?: 'error' | 'warn' | 'info' | 'debug'
}

export const ErrorLoggerPlugin: Plugin<ErrorLoggerPluginOptions> = {
  name: 'error-logger',
  version: '1.0.0',
  register: async function (server, options = {}) {
    const level = options.level ?? 'error'

    server.ext('onPreResponse', (request, h) => {
      if (request.response instanceof Boom) {
        const log = logger[level] ?? logger.error

        log({
          err: request.response,
          url: request.url.pathname,
          method: request.method,
          statusCode: request.response.output?.statusCode,
          tags: ['unhandled-error'],
          message: request.response.message || 'Unhandled error'
        })
      }

      return h.continue
    })
  }
}
