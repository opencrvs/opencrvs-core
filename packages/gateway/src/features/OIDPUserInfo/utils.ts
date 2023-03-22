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
import {
  OIDP_BASE_URL,
  OIDP_CLIENT_PRIVATE_KEY,
  OIDP_JWT_AUD_CLAIM
} from '@gateway/constants'
import { fetchFromHearth } from '@gateway/features/fhir/utils'
import { logger } from '@gateway/logger'
import { OIDPUserInfo } from './oidp-types'

const TOKEN_GRANT_TYPE = 'authorization_code'
const CLIENT_ASSERTION_TYPE =
  'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
const OIDP_TOKEN_ENDPOINT =
  OIDP_BASE_URL && new URL('oauth/token', OIDP_BASE_URL).toString()
const OIDP_USERINFO_ENDPOINT =
  OIDP_BASE_URL && new URL('oidc/userinfo', OIDP_BASE_URL).toString()

const JWT_ALG = 'RS256'
const JWT_EXPIRATION_TIME = '1h'

export type FetchTokenProps = {
  code: string
  clientId: string
  redirectUri: string
  grantType?: string
}

const searchLocationFromHearth = (name: string) =>
  fetchFromHearth<fhir.Bundle>(
    `/location?${new URLSearchParams({ name, type: 'ADMIN_STRUCTURE' })}`
  )

const findAdminStructureLocationWithName = async (name: string) => {
  const fhirBundleLocations = await searchLocationFromHearth(name)

  if ((fhirBundleLocations.entry?.length ?? 0) > 1) {
    throw new Error(
      'Multiple admin structure locations found with the same name'
    )
  }

  if ((fhirBundleLocations.entry?.length ?? 0) === 0) {
    logger.warn('No admin structure location found with the name: ' + name)
    return null
  }

  return fhirBundleLocations.entry?.[0].resource?.id
}

const pickUserInfo = async (userInfo: OIDPUserInfo) => {
  return {
    oidpUserInfo: userInfo,
    districtFhirId:
      userInfo.address?.locality &&
      (await findAdminStructureLocationWithName(userInfo.address.locality)),
    stateFhirId:
      userInfo.address?.region &&
      (await findAdminStructureLocationWithName(userInfo.address.region))
  }
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

  const request = await fetch(OIDP_TOKEN_ENDPOINT!, {
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
  const request = await fetch(OIDP_USERINFO_ENDPOINT!, {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  })

  const response = await request.text()
  const decodedResponse = decodeUserInfoResponse(response)
  return pickUserInfo(decodedResponse)
}

const generateSignedJwt = async (clientId: string) => {
  const header = {
    alg: JWT_ALG,
    typ: 'JWT'
  }

  const payload = {
    iss: clientId,
    sub: clientId,
    aud: OIDP_JWT_AUD_CLAIM
  }

  const decodeKey = Buffer.from(OIDP_CLIENT_PRIVATE_KEY!, 'base64')?.toString()
  const jwkObject = JSON.parse(decodeKey)
  const privateKey = await jose.importJWK(jwkObject, JWT_ALG)

  return new jose.SignJWT(payload)
    .setProtectedHeader(header)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION_TIME)
    .sign(privateKey)
}

const decodeUserInfoResponse = (response: string) => {
  return jwt.decode(response) as OIDPUserInfo
}
