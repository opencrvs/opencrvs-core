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
import * as Hapi from '@hapi/hapi'
import { PORT, HOST } from '@config/config/constants'
import getRoutes from '@config/config/routes'
import getPlugins from '@config/config/plugins'
import * as database from '@config/config/database'

export async function createServer() {
  const server = new Hapi.Server({
    host: HOST,
    port: PORT,
    routes: {
      cors: { origin: ['*'] },
      payload: { maxBytes: 52428800 }
    }
  })

  await server.register(getPlugins())

  const routes = getRoutes()
  server.route(routes)

  async function stop() {
    await server.stop()
    await database.stop()
    server.log('info', 'Config server stopped')
  }

  async function start() {
    await server.start()
    await database.start()
    server.log('info', `Config server started on ${HOST}:${PORT}`)
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then((server) => server.start())
}
