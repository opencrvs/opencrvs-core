// tslint:disable no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))
require('dotenv').config({
  path: `${process.cwd()}/.env`
})
// tslint:enable no-var-requires

import * as Hapi from 'hapi'

import { AUTH_HOST, AUTH_PORT } from './constants'
import authenticateHandler, {
  requestSchema as reqAuthSchema,
  responseSchema as resAuthSchema
} from './features/authenticate/handler'
import verifyCodeHandler, {
  requestSchema as reqVerifySchema,
  responseSchma as resVerifySchema
} from './features/verifyCode/handler'
import refreshTokenHandler, {
  requestSchema as reqRefreshSchema,
  responseSchma as resRefreshSchema
} from './features/refresh/handler'
import resendSmsHandler, {
  requestSchema as reqResendSmsSchema,
  responseSchma as resResendSmsSchema
} from './features/resend/handler'
import getPlugins from './config/plugins'

import * as database from './database'

export async function createServer() {
  const server = new Hapi.Server({
    host: AUTH_HOST,
    port: AUTH_PORT,
    routes: {
      cors: { origin: ['*'] }
    }
  })

  // curl -H 'Content-Type: application/json' -d '{"mobile": "+447111111111", "password": "test"}' http://localhost:4040/authenticate
  server.route({
    method: 'POST',
    path: '/authenticate',
    handler: authenticateHandler,
    options: {
      tags: ['api'],
      description: 'Authenticate with username and password',
      notes:
        'Authenticates user and returns nonce to use for collating the login for 2 factor authentication.  Sends an SMS to the user mobile with verification code',
      validate: {
        payload: reqAuthSchema
      },
      response: {
        schema: resAuthSchema
      }
    }
  })

  // curl -H 'Content-Type: application/json' -d '{"nonce": ""}' http://localhost:4040/resendSms
  server.route({
    method: 'POST',
    path: '/resendSms',
    handler: resendSmsHandler,
    options: {
      tags: ['api'],
      description: 'Resend another SMS code',
      notes:
        'Sends a new SMS code to the user based on the phone number associated with the nonce',
      validate: {
        payload: reqResendSmsSchema
      },
      response: {
        schema: resResendSmsSchema
      }
    }
  })

  // curl -H 'Content-Type: application/json' -d '{"code": "123456"}' http://localhost:4040/verifyCode
  server.route({
    method: 'POST',
    path: '/verifyCode',
    handler: verifyCodeHandler,
    options: {
      tags: ['api'],
      description: 'Verify the 2 factor auth code',
      notes:
        'Verifies the 2 factor auth code and returns the JWT API token for future requests',
      validate: {
        payload: reqVerifySchema
      },
      response: {
        schema: resVerifySchema
      }
    }
  })

  // curl -H 'Content-Type: application/json' -d '{"nonce": "", "token": ""}' http://localhost:4040/refreshToken
  server.route({
    method: 'POST',
    path: '/refreshToken',
    handler: refreshTokenHandler,
    options: {
      tags: ['api'],
      description: 'Refresh an expiring token',
      notes:
        'Verifies the expired client token as true and returns a refreshed JWT API token for future requests',
      validate: {
        payload: reqRefreshSchema
      },
      response: {
        schema: resRefreshSchema
      }
    }
  })

  await server.register(getPlugins())

  async function stop() {
    await server.stop()
    await database.stop()
    server.log('info', 'server stopped')
  }

  async function start() {
    await server.start()
    await database.start()
    server.log('info', `server started on ${AUTH_HOST}:${AUTH_PORT}`)
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
