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
import { z } from 'zod'
import { env } from './constants'
import MOSIPAuthenticator from '@mosip/ida-auth-sdk'
import { schemaJson as defaultSchemaJson } from './types/idSchemaJson'
import {
  BirthRequestFields,
  CorrectionRequestFields,
  DeathRequestFields,
  MosipInteropPayload
} from '@opencrvs/mosip/api'

/**
 * @knipignore Thrown by this module; exported so callers can narrow on it.
 */
export class MOSIPError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MOSIPError'
  }
}

/*
 * MOSIP answers a successful HTTP status even when the operation failed, putting
 * the failure in an `errors` array in the body. Response.json() is typed as
 * unknown, so the envelope is validated rather than cast.
 */
const MosipErrorEnvelope = z.object({
  errors: z
    .array(z.object({ message: z.string().optional() }))
    .nullish()
    .optional()
})

function throwIfMosipReportedError(body: unknown, context: string) {
  const { data } = MosipErrorEnvelope.safeParse(body)

  if (data?.errors?.length) {
    throw new Error(`Error in ${context}, response: ${data.errors[0]?.message}`)
  }
}

function fetchWithLog(url: string, options?: RequestInit): Promise<Response> {
  // NOTE! Be cautious with UNSAFE_DEBUG_LOG as it may log sensitive information. Make sure to disable it in production or when handling real data.
  if (env.UNSAFE_DEBUG_LOG) {
    console.log(`[MOSIP-API] Request URL: ${url}`)
    if (options?.body) {
      console.log(`[MOSIP-API] Request Body: ${options.body}`)
    }
    if (options?.headers) {
      console.log(
        `[MOSIP-API] Request Headers: ${JSON.stringify(options.headers)}`
      )
    }
  }
  return fetch(url, options)
}

export type AuthType = 'PACKET' | 'WEBSUB'

export async function getMosipAuthToken(authType: AuthType) {
  const response = await fetchWithLog(env.MOSIP_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: 'string',
      version: 'string',
      requesttime: new Date().toISOString(),
      metadata: {},
      request: {
        clientId:
          authType === 'PACKET'
            ? env.MOSIP_PACKET_AUTH_CLIENT_ID
            : env.MOSIP_WEBSUB_AUTH_CLIENT_ID,
        secretKey:
          authType === 'PACKET'
            ? env.MOSIP_PACKET_AUTH_CLIENT_SECRET
            : env.MOSIP_WEBSUB_AUTH_CLIENT_SECRET,
        appId: env.MOSIP_AUTH_CLIENT_APP_ID
      }
    })
  })

  if (!response.ok) {
    throw new MOSIPError(
      `Failed getting MOSIP auth token. Response: ${
        response.status
      }, response: ${await response.text()}`
    )
  }

  // Get the 'Set-Cookie' header from the response
  const cookie: string | null = response.headers.get('Set-Cookie')

  if (!cookie) {
    throw new MOSIPError(
      `Failed getting MOSIP auth token. Response: ${
        response.status
      }, response: ${await response.text()}`
    )
  }

  // Split the string by ';' to separate the cookie parts
  const cookieParts = cookie.split(';')

  // The first part will be the Authorization token
  const authorizationPart = cookieParts[0]

  // Extract the token by splitting on '='
  const token = authorizationPart.split('=')[1]
  return token
}

export const postBirthRecord = async ({
  event,
  requestFields,
  schemaJson,
  audit,
  metaInfo,
  notification
}: {
  event: {
    id: string
    trackingId: string
  }
  requestFields: BirthRequestFields
  schemaJson?: string
  audit: MosipInteropPayload['audit']
  metaInfo: MosipInteropPayload['metaInfo']
  notification: MosipInteropPayload['notification']
}) => {
  const requestBody = JSON.stringify(
    {
      id: 'string',
      version: 'string',
      requesttime: new Date().toISOString(),
      request: {
        id: event.id,
        refId: `${env.MOSIP_CENTER_ID}_${env.MOSIP_MACHINE_ID}`,
        offlineMode: false,
        process: 'CRVS_NEW',
        source: 'CRVS1',
        schemaVersion: '0.500',
        fields: requestFields,
        metaInfo: metaInfo,
        audits: Array.of(audit),
        schemaJson: schemaJson ?? defaultSchemaJson
      }
    },
    null,
    2
  )

  const authToken = await getMosipAuthToken('PACKET')

  // packet manager: create packet
  const createPacketResponse = await fetchWithLog(env.MOSIP_CREATE_PACKET_URL, {
    method: 'PUT',
    body: requestBody,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `Authorization=${authToken};`
    }
  })

  if (!createPacketResponse.ok) {
    throw new Error(
      `Failed sending record to MOSIP, response: ${await createPacketResponse.text()}`
    )
  }

  await createPacketResponse.json()

  // packet manager: process packet API.
  const processPacketRequestBody = JSON.stringify(
    {
      id: 'mosip.registration.processor.workflow.instance',
      requesttime: new Date().toISOString(),
      version: 'v1',
      request: {
        registrationId: event.id,
        process: 'CRVS_NEW',
        source: 'CRVS1',
        additionalInfoReqId: '',
        notificationInfo: {
          name: notification.recipientFullName,
          phone: notification.recipientPhone || '',
          email: notification.recipientEmail || ''
        }
      }
    },
    null,
    2
  )

  const processPacketResponse = await fetchWithLog(
    env.MOSIP_PROCESS_PACKET_URL,
    {
      method: 'POST',
      body: processPacketRequestBody,
      headers: {
        'Content-Type': 'application/json',
        Cookie: `Authorization=${authToken};`
      }
    }
  )

  if (!processPacketResponse.ok) {
    throw new Error(
      `Failed sending record to MOSIP, response: ${await processPacketResponse.text()}`
    )
  }

  throwIfMosipReportedError(
    await processPacketResponse.json(),
    'processing packet'
  )
}

export const postDeathRecord = async ({
  event,
  requestFields,
  schemaJson,
  audit,
  metaInfo,
  notification
}: {
  event: {
    id: string
    trackingId: string
  }
  requestFields: DeathRequestFields
  schemaJson?: string
  audit: MosipInteropPayload['audit']
  metaInfo: MosipInteropPayload['metaInfo']
  notification: MosipInteropPayload['notification']
}) => {
  const authToken = await getMosipAuthToken('PACKET')

  const { deathCertificateNumber, ...newRequestBody } = requestFields

  const deactivatePacketRequestBody = JSON.stringify(
    {
      id: 'string',
      version: 'string',
      requesttime: new Date().toISOString(),
      request: {
        id: event.id,
        refId: `${env.MOSIP_CENTER_ID}_${env.MOSIP_MACHINE_ID}`,
        offlineMode: false,
        process: 'CRVS_DEATH',
        source: 'CRVS1',
        schemaVersion: '0.500',
        fields: newRequestBody,
        metaInfo: metaInfo,
        audits: Array.of(audit),
        schemaJson: schemaJson ?? defaultSchemaJson
      }
    },
    null,
    2
  )

  // packet manager: deactivate packet
  const deactivatePacketResponse = await fetchWithLog(
    env.MOSIP_CREATE_PACKET_URL,
    {
      method: 'PUT',
      body: deactivatePacketRequestBody,
      headers: {
        'Content-Type': 'application/json',
        Cookie: `Authorization=${authToken};`
      }
    }
  )

  if (!deactivatePacketResponse.ok) {
    throw new Error(
      `Failed sending record to MOSIP, response: ${await deactivatePacketResponse.text()}`
    )
  }

  await deactivatePacketResponse.json()

  // packet manager: process packet API.
  const processPacketRequestBody = JSON.stringify(
    {
      id: 'mosip.registration.processor.workflow.instance',
      requesttime: new Date().toISOString(),
      version: 'v1',
      request: {
        registrationId: event.id,
        process: 'CRVS_DEATH',
        source: 'CRVS1',
        additionalInfoReqId: '',
        notificationInfo: {
          name: notification.recipientFullName,
          phone: notification.recipientPhone || '',
          email: notification.recipientEmail || ''
        }
      }
    },
    null,
    2
  )

  const processPacketResponse = await fetchWithLog(
    env.MOSIP_PROCESS_PACKET_URL,
    {
      method: 'POST',
      body: processPacketRequestBody,
      headers: {
        'Content-Type': 'application/json',
        Cookie: `Authorization=${authToken};`
      }
    }
  )

  if (!processPacketResponse.ok) {
    throw new Error(
      `Failed sending record to MOSIP, response: ${await processPacketResponse.text()}`
    )
  }

  throwIfMosipReportedError(
    await processPacketResponse.json(),
    'processing packet'
  )
}

export const postDemographicUpdateRecord = async ({
  event,
  requestFields,
  schemaJson,
  audit,
  metaInfo,
  notification
}: {
  event: {
    id: string
    trackingId: string
  }
  requestFields: CorrectionRequestFields
  schemaJson?: string
  audit: MosipInteropPayload['audit']
  metaInfo: MosipInteropPayload['metaInfo']
  notification: MosipInteropPayload['notification']
}) => {
  const authToken = await getMosipAuthToken('PACKET')

  const updatePacketRequestBody = JSON.stringify(
    {
      id: 'string',
      version: 'string',
      requesttime: new Date().toISOString(),
      request: {
        id: event.id,
        refId: `${env.MOSIP_CENTER_ID}_${env.MOSIP_MACHINE_ID}`,
        offlineMode: false,
        process: 'CRVS_UPDATE',
        source: 'CRVS1',
        schemaVersion: '0.500',
        fields: requestFields,
        metaInfo: metaInfo,
        audits: Array.of(audit),
        schemaJson: schemaJson ?? defaultSchemaJson
      }
    },
    null,
    2
  )

  const updatePacketResponse = await fetchWithLog(env.MOSIP_CREATE_PACKET_URL, {
    method: 'PUT',
    body: updatePacketRequestBody,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `Authorization=${authToken};`
    }
  })

  if (!updatePacketResponse.ok) {
    throw new Error(
      `Failed sending record to MOSIP, response: ${await updatePacketResponse.text()}`
    )
  }

  await updatePacketResponse.json()

  const processPacketRequestBody = JSON.stringify(
    {
      id: 'mosip.registration.processor.workflow.instance',
      requesttime: new Date().toISOString(),
      version: 'v1',
      request: {
        registrationId: event.id,
        process: 'CRVS_UPDATE',
        source: 'CRVS1',
        additionalInfoReqId: '',
        notificationInfo: {
          name: notification.recipientFullName,
          phone: notification.recipientPhone || '',
          email: notification.recipientEmail || ''
        }
      }
    },
    null,
    2
  )

  const processPacketResponse = await fetchWithLog(
    env.MOSIP_PROCESS_PACKET_URL,
    {
      method: 'POST',
      body: processPacketRequestBody,
      headers: {
        'Content-Type': 'application/json',
        Cookie: `Authorization=${authToken};`
      }
    }
  )

  if (!processPacketResponse.ok) {
    throw new Error(
      `Failed sending record to MOSIP, response: ${await processPacketResponse.text()}`
    )
  }

  throwIfMosipReportedError(
    await processPacketResponse.json(),
    'processing packet'
  )
}

export const verifyNid = async ({
  nid,
  name,
  gender,
  dob
}: {
  nid: string
  /** date of birth as YYYY/MM/DD */
  dob: string | undefined
  name: { language: string; value: string }[] | undefined
  gender: { language: string; value: string }[] | undefined
}) => {
  const authenticator = new MOSIPAuthenticator({
    partnerApiKey: env.PARTNER_APIKEY,
    partnerMispLk: env.PARTNER_MISP_LK,
    partnerId: env.PARTNER_ID,
    idaAuthDomainUri: env.IDA_AUTH_DOMAIN_URI,
    idaAuthUrl: env.IDA_AUTH_URL,
    encryptCertPath: env.ENCRYPT_CERT_PATH,
    decryptP12FilePath: env.DECRYPT_P12_FILE_PATH,
    decryptP12FilePassword: env.DECRYPT_P12_FILE_PASSWORD,
    signP12FilePath: env.SIGN_P12_FILE_PATH,
    signP12FilePassword: env.SIGN_P12_FILE_PASSWORD
  })

  const response = await authenticator.auth({
    individualId: nid,
    individualIdType: 'UIN',
    demographicData: {
      dob,
      name,
      gender
    },
    consent: true
  })

  if (!response.ok) {
    throw new Error(`Error in MOSIP Authenticator: ${await response.text()}`)
  }

  return (await response.json()) as {
    responseTime: string
    response: { authStatus: boolean; authToken: string }
  }
}
