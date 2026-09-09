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
import Fastify, { FastifyError, FastifyInstance } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider
} from 'fastify-type-provider-zod'
import { registrationEventHandler } from './routes/event-registration'
import { updateBiographicsHandler } from './routes/update-biographics'
import { env } from './constants'
import * as openapi from './openapi-documentation'
import { OIDPUserInfoSchema, OIDPQuerySchema } from './esignet-api'
import formbody from '@fastify/formbody'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { getPublicKey, assertCanConfirmRegistrations } from './opencrvs-api'
import { OIDPUserInfoHandler } from './routes/oidp-user-info'
import { initSqlite } from './database'
import {
  credentialIssuedHandler,
  credentialIssuedPreValidation,
  CredentialIssuedSchema
} from './routes/websub-credential-issued'
import { initWebSub } from './websub/subscribe'
import {
  deleteTransactionHandler,
  getAllTransactionsHandler
} from './routes/debug-sqlite'
import { verifyHandler, VerifySchema } from './routes/verify'
import { MosipInteropPayloadSchema } from '@opencrvs/mosip/api'

declare module 'fastify' {
  interface FastifyRequest {
    /** Set by the JSON parser below; needed to verify the WebSub HMAC. */
    rawBody?: Buffer
  }
}

const loggerRedactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'authorization',
  'cookie',
  'token',
  'access_token',
  'refresh_token',
  'client_assertion',
  'body.client_assertion',
  'body.code',
  'body.credential',
  'body.event.data.credential',
  'headers.authorization',
  'headers.cookie'
]

const envToLogger = {
  development: {
    level: process.env.LOG_LEVEL ?? 'debug',
    redact: {
      paths: loggerRedactPaths,
      censor: '[REDACTED]'
    },
    transport: {
      target: 'pino-pretty',
      options: {
        ignore: 'pid,hostname'
      }
    }
  },
  production: {
    level: process.env.LOG_LEVEL ?? 'info',
    redact: {
      paths: loggerRedactPaths,
      censor: '[REDACTED]'
    }
  }
}

const initRoutes = (app: FastifyInstance) => {
  /*
   * Operations and production debugging
   */
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/debug/transactions',
    handler: getAllTransactionsHandler,
    schema: {
      tags: ['Operations (Prod Debug)'],
      summary: 'List pending MOSIP transactions',
      description:
        'Returns pending OpenCRVS-to-MOSIP transaction mappings for operational troubleshooting. Requires both search scopes (birth and death).'
    }
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/debug/transactions/:id',
    handler: deleteTransactionHandler,
    schema: {
      tags: ['Operations (Prod Debug)'],
      summary: 'Discard a pending transaction',
      description:
        'Deletes a stored transaction so a stuck registration can be unblocked. Intended for production support workflows and requires record.register scope.'
    }
  })

  /*
   * OpenCRVS birth / death registration and personal information verification
   */
  app.withTypeProvider<ZodTypeProvider>().route({
    url: '/events/registration',
    method: 'POST',
    handler: registrationEventHandler,
    schema: {
      body: MosipInteropPayloadSchema
    }
  })
  app.withTypeProvider<ZodTypeProvider>().route({
    url: '/events/update-biographics',
    method: 'POST',
    handler: updateBiographicsHandler
  })
  app.withTypeProvider<ZodTypeProvider>().route({
    url: '/verify',
    method: 'POST',
    handler: verifyHandler,
    schema: {
      body: VerifySchema
    }
  })

  /*
   * E-Signet
   */
  app.withTypeProvider<ZodTypeProvider>().route({
    url: '/esignet/get-oidp-user-info',
    method: 'POST',
    handler: OIDPUserInfoHandler,
    schema: {
      body: OIDPUserInfoSchema,
      querystring: OIDPQuerySchema
    }
  })

  /**
   * MOSIP Kafka WebSub
   */
  app.get('/websub/callback', async (request, reply) => {
    const { 'hub.challenge': challenge } = request.query as {
      'hub.challenge'?: string
    }
    if (challenge) return reply.type('text/plain').send(challenge)
    else return reply.code(400).send('Missing hub.challenge')
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/websub/callback', // see constants.ts `${env.MOSIP_WEBSUB_CALLBACK_URL}`
    preValidation: credentialIssuedPreValidation,
    handler: credentialIssuedHandler,
    schema: {
      body: CredentialIssuedSchema
    }
  })
}

let corePublicKey: string
let publicKeyUpdatedAt = Date.now()
let publicKeyLogger: FastifyInstance['log']

const getCorePublicKey = async () => {
  if (!corePublicKey) {
    corePublicKey = await getPublicKey(publicKeyLogger)
  }

  return corePublicKey
}

export const buildFastify = async () => {
  const app = Fastify({
    logger: envToLogger[env.isProd ? 'production' : 'development'],
    routerOptions: {
      ignoreTrailingSlash: true // MOSIP can call /websub/callback/ with a trailing slash
    }
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  publicKeyLogger = app.log

  /*
   * Retains the exact request bytes so the WebSub HMAC can be recomputed over
   * them — MOSIP signs the body verbatim, so a re-serialization would not
   * match. Replaces Fastify's built-in JSON parser, keeping its empty-body and
   * 400-on-malformed behaviour.
   */
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (request, body, done) => {
      const buffer = body as Buffer
      request.rawBody = buffer

      if (buffer.length === 0) return done(null, undefined)

      try {
        done(null, JSON.parse(buffer.toString('utf8')))
      } catch (err) {
        ;(err as FastifyError).statusCode = 400
        done(err as Error)
      }
    }
  )

  app.register(formbody)
  app.register(cors, {
    origin: [env.CLIENT_APP_URL],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })

  openapi.register(app)

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error)
    reply.status(500).send({ error: 'An unexpected error occurred' })
  })

  app.register(jwt, {
    secret: { public: getCorePublicKey },
    verify: { algorithms: ['RS256'] }
  })

  app.addHook('onRequest', async (request, reply) => {
    // @NOTE This disables the JWT authentication for the MOSIP webhook
    // The route is open for requests, but the credential will be verified it's from MOSIP
    // This API should be allowed ONLY from the IP address of MOSIP on network / Traefik level
    if (
      request.routeOptions.url === '/websub/callback' ||
      request.url.startsWith('/documentation')
    ) {
      return
    }

    try {
      await request.jwtVerify()
    } catch (err) {
      const error = err as FastifyError

      const moreThanAMinuteSinceLastUpdate =
        Date.now() - publicKeyUpdatedAt > 60_000

      if (
        error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID' &&
        moreThanAMinuteSinceLastUpdate
      ) {
        app.log.info(
          { event: 'jwt.verify.failed.refreshing-public-key' },
          'JWT verification failed, refreshing public key'
        )
        try {
          corePublicKey = await getPublicKey(app.log)
          publicKeyUpdatedAt = Date.now()
          await request.jwtVerify()
          return
        } catch (retryErr) {
          app.log.error(
            { event: 'jwt.verify.retry.failed', err: retryErr },
            'JWT verification failed after public key refresh'
          )
        }
      } else {
        app.log.error(
          { event: 'jwt.verify.failed', err },
          'JWT verification failed'
        )
      }

      return reply.code(401).send({ error: 'Unauthorized' })
    }
  })

  app.after(() => initRoutes(app))

  return app
}

async function run() {
  const app = await buildFastify()

  // Fail fast unless this integration can authenticate and confirm
  // registrations — otherwise every confirmation would fail asynchronously,
  // long after the record was already sent to MOSIP.
  await assertCanConfirmRegistrations(app.log)

  const { wasCreated, wasConnected, database } = initSqlite(
    env.SQLITE_DATABASE_PATH
  )

  if (wasCreated) app.log.info('SQLite transaction storage created')
  if (wasConnected) app.log.info('SQLite transaction storage connected')

  await app.ready()
  await app.listen({
    port: env.PORT,
    host: env.HOST,
    listenTextResolver: () =>
      `OpenCRVS-MOSIP interoperability API running at http://${env.HOST}:${env.PORT}`
  })
  app.log.info(
    `Swagger UI running at http://${env.HOST}:${env.PORT}/documentation`
  )

  const { topic } = await initWebSub()
  app.log.info(`WebSub subscription initialized for topic '${topic}'`)

  process.on('exit', () => {
    database.close()
    app.close()
  })
}

// Only run daemon if it's executed directly - as in `tsx index.ts` for example
if (require.main === module) {
  void run()
}
