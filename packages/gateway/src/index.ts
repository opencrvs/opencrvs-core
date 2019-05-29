// tslint:disable-next-line no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))

import * as Hapi from 'hapi'
import * as DotEnv from 'dotenv'
import { getPlugins } from 'src/config/plugins'
import { getServer } from 'src/config/server'
import { getLogger } from 'src/utils/logger'
import { getRoutes } from 'src/config/routes'
import {
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL
} from 'src/constants'
import { readFileSync } from 'fs'
import { validateFunc } from '@opencrvs/commons'

DotEnv.config({
  path: `${process.cwd()}/.env`
})

const graphQLSchemaPath = `${process.cwd()}/src/graphql/index.graphql`

const logger = getLogger(Number(process.env.LOG_LEVEL), process.env.APP_NAME)

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  const server = getServer(process.env.NODE_ENV, process.env.PORT, logger)
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

  async function start() {
    await server.start()
    server.log('info', `server started on port ${process.env.PORT}`)
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
