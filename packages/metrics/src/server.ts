import * as Hapi from '@hapi/hapi'
import {
  HOST,
  PORT,
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL
} from '@metrics/constants'
import getPlugins from '@metrics/config/plugins'
import { getRoutes } from '@metrics/config/routes'
import { readFileSync } from 'fs'
import { influx } from '@metrics/influxdb/client'
import {
  INFLUX_DB,
  INFLUX_HOST,
  INFLUX_PORT
} from '@metrics/influxdb/constants'
import { validateFunc } from '@opencrvs/commons'

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

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

  server.auth.strategy('jwt', 'jwt', {
    key: publicCert,
    verifyOptions: {
      algorithms: ['RS256'],
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:metrics-user'
    },
    validate: (payload: any, request: Hapi.Request) =>
      validateFunc(payload, request, CHECK_INVALID_TOKEN, AUTH_URL)
  })

  server.auth.default('jwt')

  const routes = getRoutes()
  server.route(routes)

  server.ext({
    type: 'onRequest',
    method(request: Hapi.Request & { sentryScope: any }, h) {
      if (request.payload) {
        request.sentryScope.setExtra('payload', request.payload)
      }
      return h.continue
    }
  })

  async function start() {
    influx
      .getDatabaseNames()
      .then((names: any) => {
        if (!names.includes(INFLUX_DB)) {
          return influx.createDatabase(INFLUX_DB)
        }
      })
      .then(async () => {
        server.log('info', `InfluxDB started on ${INFLUX_HOST}:${INFLUX_PORT}`)
        await server.start()
        server.log('info', `Metrics server started on ${HOST}:${PORT}`)
      })
      .catch((err: Error) => {
        server.log('info', `Error creating Influx database! ${err.stack}`)
      })
  }

  async function stop() {
    await server.stop()
    server.log('info', 'Metrics server stopped')
  }

  return { server, start, stop }
}
