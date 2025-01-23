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

import { appRouter } from './router/router'
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { getUserId, TokenWithBearer } from '@opencrvs/commons/authentication'
import { TRPCError } from '@trpc/server'
import { getUser, logger } from '@opencrvs/commons'
import { env } from './environment'
import { getEventConfigurations } from './service/config/config'
import { ensureIndexExists } from './service/indexing/indexing'
import { getAnonymousToken } from './service/auth'

const server = createHTTPServer({
  router: appRouter,
  createContext: async function createContext(opts) {
    const parseResult = TokenWithBearer.safeParse(
      opts.req.headers.authorization
    )

    if (!parseResult.success) {
      throw new TRPCError({
        code: 'UNAUTHORIZED'
      })
    }

    const token = parseResult.data

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
      token: token
    }
  }
})

export async function main() {
  const configurations = await getEventConfigurations(await getAnonymousToken())
  for (const configuration of configurations) {
    logger.info(`Loaded event configuration: ${configuration.id}`)
    await ensureIndexExists(configuration)
  }

  server.listen(5555)
}

void main()
