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
import type { FieldValue } from '@opencrvs/toolkit/events'
import { z } from 'zod'

export const BirthRequestFieldsSchema = z.looseObject({
  birthCertificateNumber: z.string(),
  deathCertificateNumber: z.undefined().optional()
})

export const DeathRequestFieldsSchema = z.looseObject({
  deathCertificateNumber: z.string(),
  birthCertificateNumber: z.undefined().optional()
})

export const CorrectionRequestFieldsSchema = z.looseObject({
  VID: z.string(),
  fullName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  introducerInfoToken: z.string().optional(),
  birthCertificateNumber: z.undefined().optional(),
  deathCertificateNumber: z.undefined().optional()
})

export const MosipNotificationSchema = z.object({
  recipientFullName: z.string(),
  recipientEmail: z.string(),
  recipientPhone: z.string()
})

export const MosipInteropPayloadSchema = z.object({
  trackingId: z.string(),
  notification: MosipNotificationSchema,
  requestFields: z.union([
    BirthRequestFieldsSchema,
    DeathRequestFieldsSchema,
    CorrectionRequestFieldsSchema
  ]),
  schemaJson: z.string().optional(),
  metaInfo: z.record(z.string(), z.unknown()),
  audit: z.record(z.string(), z.unknown())
})

export const MosipCorrectionPayloadSchema = z.object({
  trackingId: z.string(),
  notification: MosipNotificationSchema,
  requestFields: z.object({
    VID: z.string(),
    fullName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    introducerInfoToken: z.string().optional()
  }),
  schemaJson: z.string().optional(),
  metaInfo: z.record(z.string(), z.unknown()),
  audit: z.record(z.string(), z.unknown())
})

const FieldValueSchema = z.custom<FieldValue>(() => true)

export const VerifyNidPayloadSchema = z.object({
  nid: FieldValueSchema,
  gender: FieldValueSchema.optional(),
  dob: FieldValueSchema,
  name: FieldValueSchema,
  transactionId: z.string().optional()
})

export const VerifyNidResponseSchema = z.union([
  z.literal('verified'),
  z.literal('failed')
])

export const RegistrationEventResponseSchema = z.record(z.string(), z.unknown())

export type BirthRequestFields = z.infer<typeof BirthRequestFieldsSchema>
export type DeathRequestFields = z.infer<typeof DeathRequestFieldsSchema>
export type CorrectionRequestFields = z.infer<
  typeof CorrectionRequestFieldsSchema
>
export type MosipInteropPayload = z.infer<typeof MosipInteropPayloadSchema>
export type MosipCorrectionPayload = z.infer<
  typeof MosipCorrectionPayloadSchema
>
export type VerifyNidPayload = z.infer<typeof VerifyNidPayloadSchema>
export type VerifyNidResponse = z.infer<typeof VerifyNidResponseSchema>

export interface VerificationStatus {
  father: boolean
  mother: boolean
  informant: boolean
  deceased: boolean
  spouse: boolean
}

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit = {},
  timeoutMs = 15000
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal
    })
    return response
  } finally {
    clearTimeout(timeout)
  }
}

export const createMosipInteropClient = (
  url: string,
  authorizationHeader: string
) => {
  return {
    register: async (payload: MosipInteropPayload) => {
      const parsedPayload = MosipInteropPayloadSchema.parse(payload)
      const MOSIP_API_REGISTRATION_EVENT_URL = new URL(
        './events/registration',
        url
      ).href

      const response = await fetchWithTimeout(
        MOSIP_API_REGISTRATION_EVENT_URL,
        {
          method: 'POST',
          body: JSON.stringify(parsedPayload),
          headers: {
            Authorization: authorizationHeader,
            'content-type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to register event: ${await response.text()}`)
      }

      return RegistrationEventResponseSchema.parse(await response.json())
    },
    updateBiographics: async (payload: MosipCorrectionPayload) => {
      const parsedPayload = MosipCorrectionPayloadSchema.parse(payload)
      const MOSIP_API_CORRECTION_EVENT_URL = new URL(
        './events/update-biographics',
        url
      ).href

      const response = await fetchWithTimeout(MOSIP_API_CORRECTION_EVENT_URL, {
        method: 'POST',
        body: JSON.stringify(parsedPayload),
        headers: {
          Authorization: authorizationHeader,
          'content-type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(
          `Failed to update biographics: ${await response.text()}`
        )
      }

      return RegistrationEventResponseSchema.parse(await response.json())
    },
    verifyNid: async (payload: VerifyNidPayload) => {
      const parsedPayload = VerifyNidPayloadSchema.parse(payload)
      const MOSIP_API_VERIFY_URL = new URL('./verify', url).href

      const response = await fetchWithTimeout(MOSIP_API_VERIFY_URL, {
        method: 'POST',
        body: JSON.stringify(parsedPayload),
        headers: {
          Authorization: authorizationHeader,
          'content-type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to verify: ${await response.text()}`)
      }

      return VerifyNidResponseSchema.parse(await response.text())
    }
  }
}
