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
import { CLIENT_APP_URL, GATEWAY_URL } from '@countryconfig/constants'
import { env } from '@countryconfig/environment'
import { logger } from '@countryconfig/logger'
import { ServerRoute, ReqRefDefaults } from '@hapi/hapi'
import { createClient } from '@opencrvs/toolkit/api'
import { getBearerToken } from '@countryconfig/utils'
import QRCode from 'qrcode'
import { birthCredentialTemplate } from './birth-credential-template'
import { paperBirthCredentialTemplate } from './paper-birth-credential-template'

/**
 * Example responses OpenCRVS expects from your credential issuer.
 * These are used for development and testing, and you can replace them with your actual issuer endpoints. Just make sure to keep the same response format.
 */
const exampleOid4vcIssuanceResponse = {
  method: 'POST',
  path: '/_demo-issuer/openid4vc/sdjwt/issue',
  handler: () =>
    'openid-credential-offer://?credential_offer_uri=https%3A%2F%2Fissuer.example.com%2Foffers%2F2K5sgesB'
} satisfies ServerRoute<ReqRefDefaults>

const exampleRawJwtSignResponse = {
  method: 'POST',
  path: '/_demo-issuer/raw/jwt/sign',
  handler: () =>
    'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvbiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
} satisfies ServerRoute<ReqRefDefaults>

const credentialOfferRoute = {
  method: 'POST',
  path: '/verifiable-credentials/credential-offer',
  handler: async (req) => {
    const pathname = (req.payload as Record<string, string>).pathname
    const match = pathname.match(/\/events\/([a-f0-9-]{36})/i)
    const eventId = match?.[1]

    if (!eventId) {
      throw new Error('Invalid event ID in pathname')
    }

    logger.info(
      `[verifiable credentials] requesting credential offer for <event-id:${eventId}>`
    )

    const url = new URL('events', GATEWAY_URL).toString()
    const client = createClient(url, getBearerToken(req.headers.authorization))
    const event = await client.event.search.query({
      query: {
        type: 'and',
        clauses: [
          {
            id: eventId
          }
        ]
      }
    })
    const response = await fetch(env.VERIFIABLE_CREDENTIALS_SDJWT_ISSUE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getBearerToken(req.headers.authorization)
      },
      body: JSON.stringify(birthCredentialTemplate(event.results[0]))
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error(
        `[verifiable credentials] failed to get credential offer for <event-id:${eventId}>: ${errorText}`
      )
      throw new Error(
        `Failed to get credential offer: ${response.status} ${errorText}`
      )
    }

    const credentialOfferUrl = (await response.text()) as string

    const qrDataUrl = await QRCode.toDataURL(credentialOfferUrl, {
      width: 300,
      errorCorrectionLevel: 'M'
    })

    return {
      credential_offer_uri: credentialOfferUrl,
      credential_offer_uri_qr: qrDataUrl
    }
  }
} satisfies ServerRoute<ReqRefDefaults>

const paperCredentialRoute = {
  method: 'POST',
  path: '/verifiable-credentials/paper-credential',
  handler: async (req) => {
    const pathname = (req.payload as Record<string, string>).pathname
    const match = pathname.match(
      /\/events\/(?:print-certificate\/)?([a-f0-9-]{36})/i
    )
    const eventId = match?.[1]

    if (!eventId) {
      throw new Error('Invalid event ID in pathname')
    }

    if (!req.headers.authorization) {
      throw new Error('Missing authorization header')
    }

    logger.info(
      `[verifiable credentials] requesting paper credential for <event-id:${eventId}>`
    )

    const url = new URL('events', GATEWAY_URL).toString()
    const client = createClient(url, getBearerToken(req.headers.authorization))
    const event = await client.event.search.query({
      query: {
        type: 'and',
        clauses: [
          {
            id: eventId
          }
        ]
      }
    })

    if (!event.results.length) {
      throw new Error(`No event found for id: ${eventId}`)
    }

    const response = await fetch(env.VERIFIABLE_CREDENTIALS_RAW_JWT_SIGN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getBearerToken(req.headers.authorization)
      },
      body: JSON.stringify(paperBirthCredentialTemplate(event.results[0]))
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error(
        `[verifiable credentials] failed to issue paper credential for <event-id:${eventId}>: ${errorText}`
      )
      throw new Error(
        `Failed to issue paper credential: ${response.status} ${errorText}`
      )
    }

    const credentialJwt = (await response.text()).trim().replace(/^"|"$/g, '')

    if (credentialJwt.split('.').length !== 3) {
      throw new Error('Issuer did not return a JWT credential')
    }

    const paperVcQrDataUrl = await QRCode.toDataURL(credentialJwt, {
      width: 600,
      errorCorrectionLevel: 'L'
    })

    return {
      credential: credentialJwt,
      credential_qr: paperVcQrDataUrl
    }
  }
} satisfies ServerRoute<ReqRefDefaults>

/** FieldType.HTTP uses this URL to fetch the credential offer from the form */
export const CREDENTIAL_OFFER_HANDLER_URL = new URL(
  `api/countryconfig/${credentialOfferRoute.path}`,
  CLIENT_APP_URL
).toString()

export const PAPER_CREDENTIAL_HANDLER_URL = new URL(
  `api/countryconfig/${paperCredentialRoute.path}`,
  CLIENT_APP_URL
).toString()

export default function getVerifiableCredentialRoutes(): ServerRoute<ReqRefDefaults>[] {
  return [
    exampleOid4vcIssuanceResponse,
    exampleRawJwtSignResponse,
    credentialOfferRoute,
    paperCredentialRoute
  ]
}
