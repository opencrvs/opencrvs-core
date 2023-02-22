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
import * as Joi from 'joi'
import jwt from 'jsonwebtoken'
import { OpenIDConnectUserInfoResponse } from './oidp-types'

const TOKEN_GRANT_TYPE = 'authorization_code'
const CLIENT_ASSERTION_TYPE = 'code'
const OIDP_BASE_URL = process.env.OIDP_BASE_URL!
const OIDP_AUD_URL = process.env.OIDP_AUD_URL!
const OIDP_CLIENT_PRIVATE_KEY = process.env.OIDP_CLIENT_PRIVATE_KEY!
const OIDP_TOKEN_ENDPOINT = '/oauth/token'
const OIDP_USERINFO_ENDPOINT = '/oidc/userinfo'

const JWT_ALG = 'RS256'
const JWT_EXPIRATION_TIME = '1h'

export type FetchTokenProps = {
  code: string
  clientId: string
  redirectUri: string
  grantType: string
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

  const request = await fetch(OIDP_BASE_URL + OIDP_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  const response = await request.json()
  return response as { access_token: string }
}

export const fetchTokenPayloadSchema = Joi.object({
  code: Joi.string().required(),
  clientId: Joi.string().required(),
  redirectUri: Joi.string().required(),
  grantType: Joi.string().required()
})

export const fetchUserInfo = async (accessToken: string) => {
  const request = await fetch(OIDP_BASE_URL + OIDP_USERINFO_ENDPOINT, {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  })

  const response = (await request.json()) as string
  return decodeUserInfoResponse(response)
}

const generateSignedJwt = async (clientId: string) => {
  const header = {
    alg: JWT_ALG,
    typ: 'JWT'
  }

  const payload = {
    iss: clientId,
    sub: clientId,
    aud: OIDP_AUD_URL
  }

  const privateKey = Buffer.from(OIDP_CLIENT_PRIVATE_KEY, 'base64').toString()

  return jwt.sign(payload, privateKey, {
    header,
    algorithm: JWT_ALG,
    expiresIn: JWT_EXPIRATION_TIME
  })
}

const decodeUserInfoResponse = async (response: string) => {
  return jwt.decode(response) as OpenIDConnectUserInfoResponse
}
