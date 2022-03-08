import * as Hapi from '@hapi/hapi'
import { getPlugins } from '@gateway/config/plugins'
import { getRoutes } from '@gateway/config/routes'
import {
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL,
  PORT,
  HOST
} from '@gateway/constants'
import { readFileSync } from 'fs'
import { validateFunc } from '@opencrvs/commons'
import {
  ApolloServer,
  ApolloServerPluginStopHapiServer
} from 'apollo-server-hapi'
import { getApolloConfig } from '@gateway/graphql/config'
import * as database from '@gateway/features/user/database'

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  const app = new Hapi.Server({
    host: HOST,
    port: PORT,
    routes: {
      cors: { origin: ['*'] },
      payload: { maxBytes: 52428800 }
    }
  })
  const plugins = getPlugins()

  await app.register(plugins)

  const apolloServer = new ApolloServer({
    ...getApolloConfig(),
    plugins: [ApolloServerPluginStopHapiServer({ hapiServer: app })]
  })
  app.auth.strategy('jwt', 'jwt', {
    key: publicCert,
    verifyOptions: {
      algorithms: ['RS256'],
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:gateway-user'
    },
    validate: (payload: any, request: Hapi.Request) =>
      validateFunc(payload, request, CHECK_INVALID_TOKEN, AUTH_URL)
  })

  app.auth.default('jwt')

  const routes = getRoutes()
  app.route(routes)

  /*
   * For debugging sent applications on pre-prod environments.
   * Custom implementation a sGood doesn't support logging request payloads
   * https://github.com/hapijs/good/search?q=request&type=Issues
   */
  if (process.env.NODE_ENV !== 'production') {
    app.events.on('response', (request) => {
      app.log('info', JSON.stringify(request.payload))
    })
  }

  async function start() {
    await apolloServer.start()
    await app.start()
    await database.start()
    await apolloServer.applyMiddleware({
      app
    })
    app.log('info', `server started on port ${PORT}`)
  }

  async function stop() {
    await app.stop()
    await database.stop()
    app.log('info', 'server stopped')
  }

  return { app, start, stop }
}
