import * as Hapi from 'hapi'

import { AUTH_HOST, AUTH_PORT } from './constants'
import authenticateHandler from './features/authenticate/handler'
import verifyCodeHandler from './features/verifyCode/handler'
import getPlugins from './config/plugins'

const server = new Hapi.Server({
  host: AUTH_HOST,
  port: AUTH_PORT,
  routes: {
    cors: { origin: ['*'] }
  }
})

async function init() {
  await server.register(getPlugins())
}

// curl -H 'Content-Type: application/json' -d '{"mobile": "27845829934", "password": "test"}' http://localhost:4040/authenticate
server.route({
  method: 'POST',
  path: '/authenticate',
  handler: authenticateHandler
})

// curl -H 'Content-Type: application/json' -d '{"code": "123456"}' http://localhost:4040/verifyCode
server.route({
  method: 'POST',
  path: '/verifyCode',
  handler: verifyCodeHandler
})

export async function start() {
  await init()
  await server.start()
  server.log('info', `server started on ${AUTH_HOST}:${AUTH_PORT}`)
}

export async function stop() {
  await server.stop()
  server.log('info', 'server stopped')
}

if (!module.parent) {
  start()
}
