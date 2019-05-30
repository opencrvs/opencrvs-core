// tslint:disable-next-line no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))

import * as DotEnv from 'dotenv'
import { getPlugins } from '@gateway/config/plugins'
import { getServer } from '@gateway/config/server'
import { getLogger } from '@gateway/utils/logger'
import { getRoutes } from '@gateway/config/routes'
import { CERT_PUBLIC_KEY_PATH } from '@gateway/constants'
import { readFileSync } from 'fs'

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
    validate: (payload: any, request: any) => ({
      isValid: true,
      credentials: payload
    })
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
