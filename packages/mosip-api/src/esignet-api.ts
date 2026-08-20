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

import * as jwt from 'jsonwebtoken'
import { env } from './constants'
import z from 'zod'
import * as jose from 'jose'
import { isValid, format, Locale, parse } from 'date-fns'
import { enGB } from 'date-fns/locale/en-GB'
import { fr } from 'date-fns/locale/fr'
import fs from 'node:fs'
import type { FastifyBaseLogger } from 'fastify'
import crypto from 'node:crypto'

const OIDP_CLIENT_PRIVATE_KEY = fs
  .readFileSync(env.OIDP_CLIENT_PRIVATE_KEY_PATH)
  .toString()
/**
 * @knipignore Looked up by the env-driven LOCALE below rather than imported.
 */
export const locales: Record<string, Locale> = { en: enGB, fr }

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
  individual_id?: string
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

const JWT_EXPIRATION_TIME = '1h'
const JWT_ALG = 'RS256'

export const OIDPUserInfoSchema = z.object({
  clientId: z.string(),
  redirectUri: z.string()
})

export const OIDPQuerySchema = z.object({
  code: z.string(),
  state: z.string()
})

type FetchTokenProps = {
  code: string
  clientId: string
  redirectUri: string
  grantType?: string
  logger: FastifyBaseLogger
}

const generateSignedJwt = async (clientId: string) => {
  const header = {
    alg: JWT_ALG,
    typ: 'JWT'
  }

  const payload = {
    iss: clientId,
    sub: clientId,
    aud: env.ESIGNET_TOKEN_URL,
    jti: crypto.randomUUID()
  }

  const decodeKey = Buffer.from(OIDP_CLIENT_PRIVATE_KEY, 'base64')?.toString()
  const jwkObject = JSON.parse(decodeKey)
  const privateKey = await jose.importJWK(jwkObject, JWT_ALG)

  return new jose.SignJWT(payload)
    .setProtectedHeader(header)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION_TIME)
    .sign(privateKey)
}

export const fetchToken = async ({
  code,
  clientId,
  redirectUri,
  logger
}: FetchTokenProps) => {
  const clientAssertion = await generateSignedJwt(clientId)

  const redirectUriWithoutQuery = redirectUri?.split('?')[0] ?? redirectUri
  const body = new URLSearchParams({
    code: code,
    client_id: clientId,
    redirect_uri: redirectUriWithoutQuery,
    grant_type: 'authorization_code',
    client_assertion_type:
      'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    client_assertion: clientAssertion
  })

  logger.debug(
    {
      event: 'esignet.token.request',
      tokenUrl: env.ESIGNET_TOKEN_URL,
      redirectUri: redirectUriWithoutQuery
    },
    'Requesting E-Signet token'
  )

  const request = await fetch(env.ESIGNET_TOKEN_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  if (!request.ok) {
    logger.warn(
      {
        event: 'esignet.token.request.failed',
        statusCode: request.status
      },
      'E-Signet token request failed'
    )
    throw new Error(`OIDP token request failed with status ${request.status}`)
  }

  const response = await request.json()
  return response as { access_token?: string }
}

function formatDate(dateString: string, formatStr = 'PP') {
  const date = parse(dateString, 'yyyy/MM/dd', new Date())
  if (!isValid(date)) {
    return ''
  }
  return format(date, formatStr, {
    locale: locales[env.LOCALE]
  })
}

const pickUserInfo = async (userInfo: OIDPUserInfo) => {
  return {
    sub: userInfo.sub, // usually holds the PSUT
    name: {
      firstname: userInfo.name?.split(' ')[0],
      surname: userInfo.name?.split(' ').at(-1)
    },
    gender: userInfo?.gender?.toLowerCase(),
    ...(userInfo.birthdate && {
      dobUnknown: null,
      birthDate: formatDate(userInfo.birthdate, 'yyyy-MM-dd')
    }),
    verificationStatus: 'authenticated',
    idType: userInfo.individual_id ? 'NATIONAL_ID' : null,
    nid: userInfo.individual_id ?? null
  }
}

const decodeUserInfoResponse = (response: string) => {
  return jwt.decode(response) as OIDPUserInfo
}

export const fetchUserInfo = async (
  accessToken: string,
  logger: FastifyBaseLogger
) => {
  const request = await fetch(env.ESIGNET_USERINFO_URL, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  })

  if (!request.ok) {
    logger.warn(
      {
        event: 'esignet.userinfo.request.failed',
        statusCode: request.status
      },
      'E-Signet user info request failed'
    )
    throw new Error(
      `OIDP user info request failed with status ${request.status}`
    )
  }

  const response = await request.text()
  const decodedResponse = decodeUserInfoResponse(response)

  if (!decodedResponse) {
    throw new Error(
      'Something went wrong with the OIDP user info request. No user info was returned.'
    )
  }
  return pickUserInfo(decodedResponse)
}
