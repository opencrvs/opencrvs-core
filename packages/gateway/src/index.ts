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
// tslint:disable-next-line no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))

import * as Hapi from 'hapi'
import * as DotEnv from 'dotenv'
import { getPlugins } from '@gateway/config/plugins'
import { getServer } from '@gateway/config/server'
import { getRoutes } from '@gateway/config/routes'
import {
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL,
  PORT
} from '@gateway/constants'
import { readFileSync } from 'fs'
import { validateFunc } from '@opencrvs/commons'

DotEnv.config({
  path: `${process.cwd()}/.env`
})

const graphQLSchemaPath = `${__dirname}/graphql/index.graphql`

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  const server = getServer()
  const plugins = getPlugins(process.env.NODE_ENV, graphQLSchemaPath)

  await server.register(plugins)

  server.auth.strategy('jwt', 'jwt', {
    key: publicCert,
    verifyOptions: {
      algorithms: ['RS256'],
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:gateway-user'
    },
    validate: (payload: any, request: Hapi.Request) =>
      validateFunc(payload, request, CHECK_INVALID_TOKEN, AUTH_URL)
  })

  server.auth.default('jwt')

  const routes = getRoutes()
  server.route(routes)

  /*
   * For debugging sent applications on pre-prod environments.
   * Custom implementation a sGood doesn't support logging request payloads
   * https://github.com/hapijs/good/search?q=request&type=Issues
   */
  if (process.env.NODE_ENV !== 'production') {
    server.events.on('response', request => {
      server.log('info', JSON.stringify(request.payload))
    })
  }

  async function start() {
    await server.start()
    server.log('info', `server started on port ${PORT}`)
  }

  async function stop() {
    await server.stop()
    server.log('info', 'server stopped')
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
