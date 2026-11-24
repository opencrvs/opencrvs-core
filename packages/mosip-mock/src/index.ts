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
import Fastify from 'fastify'
import formbody from '@fastify/formbody'
import { EMAIL_ENABLED, env, PRIVATE_KEY } from './constants'
import { packetManagerCreateHandler } from './routes/packet-manager-create'
import { packetManagerProcessHandler } from './routes/packet-manager-process'
import { idAuthenticationHandler } from './ida-auth-sdk/id-authentication'
import { webSubHubHandler } from './websub/websub-hub'
import { packetManagerAuthHandler } from './routes/packet-manager-auth'
import { createPrivateKey, createPublicKey } from 'node:crypto'
import { PUBLIC_KEY_URL } from './verifiable-credentials/issue'

const app = Fastify({ logger: true })

app.register(formbody)

app.post('/idauthentication/v1/auth/:mispLk/:partnerId/:apiKey', {
  handler: idAuthenticationHandler
})
app.get('/.well-known/public-key.json', (_, reply) => {
  const privateKey = createPrivateKey(PRIVATE_KEY)
  const publicKey = createPublicKey(privateKey)

  const publicKeyPem = publicKey
    .export({ format: 'pem', type: 'spki' })
    .toString()

  const publicKeyJson = {
    '@context': 'https://w3id.org/security/v2',
    type: 'RsaVerificationKey2018',
    id: PUBLIC_KEY_URL,
    controller: `${env.ISSUER_URL}/.well-known/controller.json`,
    publicKeyPem
  }
  reply.send(publicKeyJson)
})

/**
 * MOSIP WebSub hub
 */
app.post('/websub/hub', { handler: webSubHubHandler })
app.post('/v1/authmanager/authenticate/clientidsecretkey', {
  handler: packetManagerAuthHandler
})
app.put('/commons/v1/packetmanager/createPacket', {
  handler: packetManagerCreateHandler
})
app.post('/registrationprocessor/v1/workflowmanager/workflowinstance', {
  handler: packetManagerProcessHandler
})

async function run() {
  if (env.isProd) {
    app.log.warn(
      'You are running MOCK national ID server in production. Identifiers can be logged.'
    )
  }

  await app.ready()
  await app.listen({
    port: env.PORT,
    host: env.HOST
  })

  const emailStatus = EMAIL_ENABLED ? 'Emails enabled' : 'Emails disabled'

  app.log.info(`MOSIP mock server running at http://${env.HOST}:${env.PORT}`)
  app.log.info(emailStatus)
}

void run()
