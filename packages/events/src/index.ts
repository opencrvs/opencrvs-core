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
import { getUser } from '@opencrvs/commons'
import { env } from './environment'

const server = createHTTPServer({
  router: appRouter,
  createContext: async function createContext(opts) {
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

    const { primaryOfficeId } = await getUser(
      env.USER_MANAGEMENT_URL,
      userId,
      token
    )

    return {
      user: {
        id: userId,
        primaryOfficeId
      },
      token
    }
  }
})

server.listen(5555)
