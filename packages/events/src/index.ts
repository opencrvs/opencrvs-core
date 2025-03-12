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
import { getCurrentEventState, getUser, logger } from '@opencrvs/commons'
import { env } from './environment'
import { getEventConfigurations } from './service/config/config'
import { ensureIndexExists } from './service/indexing/indexing'
import { getAnonymousToken } from './service/auth'
const foo = {
  type: 'tennis-club-membership',
  id: '4d299f0a-2644-40a1-a556-ddfc937a5fa7',
  createdAt: '2025-03-11T11:09:38.752Z',
  updatedAt: '2025-03-11T11:11:05.413Z',
  trackingId: '3S4VVM',
  actions: [
    {
      type: 'CREATE',
      createdAt: '2025-03-11T11:09:38.752Z',
      createdBy: '677fb08630f3abfa33072718',
      createdAtLocation: '657f43f7-4e85-40bf-a447-13d85de01084',
      id: '1bee67f8-6d06-42fa-ad02-44d23c3e5bcd',
      data: {}
    },
    {
      data: {
        'recommender.none': true,
        'applicant.firstname': 'matti',
        'applicant.surname': 'masaa',
        'applicant.dob': '2024-02-22',
        'applicant.image.label': '1231-123'
      },
      type: 'DECLARE',
      createdBy: '677fb08630f3abfa33072718',
      createdAt: '2025-03-11T11:11:05.413Z',
      createdAtLocation: '657f43f7-4e85-40bf-a447-13d85de01084',
      id: '0bdefbc8-207b-4b4b-b585-6f118ab4b1ef'
    },
    {
      data: {
        'recommender.none': true,
        'applicant.firstname': 'matti',
        'applicant.surname': 'masaa',
        'applicant.dob': '2024-02-22',
        'applicant.image.label': null
      },
      type: 'DECLARE',
      createdBy: '677fb08630f3abfa33072718',
      createdAt: '2025-03-11T11:11:05.413Z',
      createdAtLocation: '657f43f7-4e85-40bf-a447-13d85de01084',
      id: '0bdefbc8-207b-4b4b-b585-6f118ab4b1ef'
    }
  ]
}

getCurrentEventState(foo as any)

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
  try {
    console.log(getCurrentEventState(foo as any))
    const configurations = await getEventConfigurations(
      await getAnonymousToken()
    )
    for (const configuration of configurations) {
      logger.info(`Loaded event configuration: ${configuration.id}`)
      await ensureIndexExists(configuration)
    }
  } catch (error) {
    logger.error(error)
    if (env.isProd) {
      process.exit(1)
    }
    /*
     * SIGUSR2 tells nodemon to restart the process without waiting for new file changes
     */
    setTimeout(() => process.kill(process.pid, 'SIGUSR2'), 3000)
    return
  }

  server.listen(5555)
}

void main()
