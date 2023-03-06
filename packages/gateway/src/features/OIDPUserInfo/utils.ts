/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as jwt from 'jsonwebtoken'
import * as jose from 'jose'
import fetch from 'node-fetch'
import { OIDP_BASE_URL, OIDP_CLIENT_PRIVATE_KEY } from '@gateway/constants'

const TOKEN_GRANT_TYPE = 'authorization_code'
const CLIENT_ASSERTION_TYPE =
  'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
const OIDP_TOKEN_ENDPOINT = new URL('oauth/token', OIDP_BASE_URL).toString()
const OIDP_USERINFO_ENDPOINT = new URL(
  'oidc/userinfo',
  OIDP_BASE_URL
).toString()

const JWT_ALG = 'RS256'
const JWT_EXPIRATION_TIME = '1h'

export type FetchTokenProps = {
  code: string
  clientId: string
  redirectUri: string
  grantType?: string
}

export const fetchToken = async ({
  code,
  clientId,
  redirectUri,
  grantType = TOKEN_GRANT_TYPE
}: FetchTokenProps) => {
  const body = new URLSearchParams({
    code: code,
    client_id: clientId,
    redirect_uri: redirectUri,
    grant_type: grantType,
    client_assertion_type: CLIENT_ASSERTION_TYPE,
    client_assertion: await generateSignedJwt(clientId)
  })

  const request = await fetch(OIDP_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  const response = await request.json()
  return response as { access_token?: string }
}

export const fetchUserInfo = async (accessToken: string) => {
  const request = await fetch(OIDP_USERINFO_ENDPOINT, {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  })

  const response = await request.text()
  const decodedResponse = await decodeUserInfoResponse(response)
  return decodedResponse
}

const generateSignedJwt = async (clientId: string) => {
  const header = {
    alg: JWT_ALG,
    typ: 'JWT'
  }

  const payload = {
    iss: clientId,
    sub: clientId,
    aud: OIDP_TOKEN_ENDPOINT
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

const decodeUserInfoResponse = async (response: string) => {
  return jwt.decode(response)
}
