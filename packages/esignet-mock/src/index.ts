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
import { env } from './constants'
import jwt from 'jsonwebtoken'
import path from 'path'
import fastifyStatic from '@fastify/static'
import formbody from '@fastify/formbody'
import * as jose from 'jose'
import { readFileSync } from 'node:fs'
import identities from './mock-identities.json' with { type: 'json' }

const app = Fastify({ logger: true })

const JWT_ALG = 'RS256'
const JWT_EXPIRATION_TIME = '1h'
const OIDP_CLIENT_PRIVATE_KEY = readFileSync(
  env.OIDP_CLIENT_PRIVATE_KEY_PATH
).toString()

const generateSignedJwt = async (userInfo: OIDPUserInfo) => {
  const header = {
    alg: JWT_ALG,
    typ: 'JWT'
  }

  const decodeKey = Buffer.from(OIDP_CLIENT_PRIVATE_KEY, 'base64').toString()
  const jwkObject = JSON.parse(decodeKey)
  const privateKey = await jose.importJWK(jwkObject, JWT_ALG)

  return new jose.SignJWT(userInfo)
    .setProtectedHeader(header)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION_TIME)
    .sign(privateKey)
}

app.register(fastifyStatic, {
  root: path.join(__dirname, 'mock-authorizer')
})
app.register(formbody)

const tokenRequestSchema = {
  body: {
    type: 'object',
    required: ['code', 'client_id', 'redirect_uri', 'grant_type'],
    properties: {
      code: { type: 'string' },
      client_id: { type: 'string' },
      redirect_uri: { type: 'string' },
      grant_type: { type: 'string' },
      client_assertion_type: { type: 'string' },
      client_assertion: { type: 'string' }
    }
  }
}

type OIDPUserAddress = {
  formatted: string
  street_address: string
  locality: string
  region: string
  postal_code: string
  city: string
  country: string
}

type OIDPUserInfo = {
  sub: string
  name?: string
  given_name?: string
  family_name?: string
  middle_name?: string
  nickname?: string
  preferred_username?: string
  profile?: string
  picture?: string
  website?: string
  email?: string
  email_verified?: boolean
  gender?: 'female' | 'male'
  birthdate?: string
  zoneinfo?: string
  locale?: string
  phone_number?: string
  phone_number_verified?: boolean
  address?: Partial<OIDPUserAddress>
  updated_at?: number
}

/**
 * When user is redirected to ./mock-authorizer/index.html, we add the `redirect_uri` to this list.
 * Then, when userinfo is requested, we check if this list includes it.
 *
 * If it doesn't, we throw an error. It's not transactionally safe, but it's a mock server after all.
 */
const VALID_REDIRECT_URIS: string[] = []

app.get('/oidc/userinfo', {
  handler: async (request, reply) => {
    // see `index.html` if you're wondering where this comes from
    const { code, redirect_uri } = jwt.decode(
      request.headers.authorization!.split('Bearer ')[1]!
    ) as { code: string; redirect_uri: string }
    const nid = atob(code)

    const identity = identities.find((mockIdentity) => mockIdentity.nid === nid)

    /** @see VALID_REDIRECT_URIS for explanation */
    const validRedirectUriIndex = VALID_REDIRECT_URIS.indexOf(redirect_uri)
    if (validRedirectUriIndex === -1) {
      throw new Error('Invalid redirect_uri provided!')
    } else {
      VALID_REDIRECT_URIS.splice(validRedirectUriIndex, 1)
    }

    if (!identity) {
      throw new Error(`Identity "${nid}" not found! Uh oh...`)
    }

    const userInfo: OIDPUserInfo = {
      sub: '1234567890' + '1234567890' + '123456' + nid, // mosip.kernel.tokenid.length (PSUT) is generally 36 characters
      name: `${identity.firstName} ${identity.familyName}`,
      given_name: identity.firstName,
      family_name: identity.familyName,
      middle_name: identity.middleName,
      nickname: '',
      preferred_username: '',
      profile: '',
      picture: '',
      website: '',
      email: `team+esignet+${identity.firstName}@opencrvs.org`,
      email_verified: true,
      gender: identity.gender as 'female' | 'male',
      birthdate: identity.birthDate.replaceAll('-', '/'), // E-Signet uses yyyy/MM/dd
      zoneinfo: '',
      locale: 'en-US',
      phone_number: '0314412652',
      phone_number_verified: true,
      updated_at: Date.now(),
      address: {
        formatted: '221B Baker Street, Marylebone, London NW1 6XE, UK',
        street_address: '221B Baker Street',
        locality: 'Marylebone',
        region: 'London',
        postal_code: 'NW1 6XE',
        city: 'London',
        country: 'United Kingdom'
      }
    }

    return reply.send(await generateSignedJwt(userInfo))
  }
})

// TODO: Validate the search params: https://github.com/opencrvs/mosip/blob/8e9c98b29b43a25561c8b9a0d6ae9ae4136adfe8/packages/country-config/src/forms.ts#L12 and return the correct state

const authorizeSchema = {
  querystring: {
    type: 'object',
    required: [
      'client_id',
      'response_type',
      'scope',
      'acr_values',
      'claims',
      'redirect_uri'
    ],
    properties: {
      client_id: { type: 'string' },
      response_type: { type: 'string' },
      scope: { type: 'string' },
      acr_values: { type: 'string' },
      claims: { type: 'string' },
      state: { type: 'string' },
      redirect_uri: { type: 'string' }
    }
  }
}

app.get('/authorize', {
  schema: authorizeSchema,
  handler: async (request: any, reply) => {
    const htmlFilePath = path.join(__dirname, './mock-authorizer/index.html')
    const html = readFileSync(htmlFilePath, 'utf-8')

    /** See `packages/mosip-api/src/esignet-api.ts` for `redirect_uri: redirectUri?.split("?")[0] ?? redirectUri` to understand the matching of this */
    /** @see VALID_REDIRECT_URIS for explanation */
    VALID_REDIRECT_URIS.push(request.query.redirect_uri.split('?')[0])

    return reply.type('text/html').send(html)
  }
})

app.post('/oauth/token', {
  schema: tokenRequestSchema,
  handler: async (request: any, reply) => {
    const payload = {
      code: request.body.code,
      client_id: request.body.client_id,
      redirect_uri: request.body.redirect_uri,
      grant_type: request.body.grant_type,
      client_assertion_type: request.body.client_assertion_type,
      client_assertion: request.body.client_assertion
    }

    const accessToken = jwt.sign(payload, 'mock-secret', {
      expiresIn: '1h'
    })

    return reply.send({
      access_token: accessToken,
      expires_in: '1h'
    })
  }
})

async function run() {
  await app.ready()
  await app.listen({
    port: env.ESIGNET_MOCK_PORT,
    host: env.HOST
  })

  app.log.info(`E-Signet mock server running at http://${env.HOST}:${env.ESIGNET_MOCK_PORT}`)
}

void run()
