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

// eslint-disable-next-line import/no-unassigned-import
import '@opencrvs/commons/monitoring'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))

import { appRouter } from './router'
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { getUserId } from '@opencrvs/commons/authentication'
import { TRPCError } from '@trpc/server'

const server = createHTTPServer({
  router: appRouter,
  createContext: function createContext(opts) {
    const token = opts.req.headers.authorization
    if (!token) {
      throw new TRPCError({
        code: 'UNAUTHORIZED'
      })
    }

    const userId = getUserId(token)

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED'
      })
    }

    return {
      user: {
        id: userId
      }
    }
  }
})

server.listen(5555)
