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
import { EVENT_TYPE } from '@opencrvs/commons/types'
import { z } from 'zod'

export const CertifyRequestSchema = z.object({
  event: z.custom<EVENT_TYPE>(),
  certificate: z.object({
    hasShowedVerifiedDocument: z.boolean(),
    data: z.string(),
    collector: z
      .object({
        relationship: z.string(),
        otherRelationship: z.string(),
        name: z.array(
          z.object({
            use: z.string(),
            firstNames: z.string(),
            familyName: z.string()
          })
        ),
        affidavit: z
          .array(
            z.object({
              contentType: z.string(),
              data: z.string()
            })
          )
          .optional(),
        identifier: z.array(
          z.object({
            id: z.string(),
            type: z.string()
          })
        )
      })
      .or(
        z.object({
          relationship: z.string()
        })
      )
  })
})

const PaymentSchema = z.object({
  type: z.enum(['MANUAL']),
  amount: z.number(),
  outcome: z.enum(['COMPLETED', 'ERROR', 'PARTIAL']),
  date: z.string().datetime(),
  attachmentData: z.string().optional()
})

export const IssueRequestSchema = z.object({
  event: z.custom<EVENT_TYPE>(),
  certificate: CertifyRequestSchema.shape.certificate
    .omit({ data: true })
    .and(z.object({ payment: PaymentSchema }))
})

export const ChangedValuesInput = z.array(
  z.object({
    section: z.string(),
    fieldName: z.string(),
    oldValue: z.union([z.string(), z.number(), z.boolean()]),
    newValue: z.union([z.string(), z.number(), z.boolean()])
  })
)
export const CorrectionRequestInput = z.object({
  requester: z.string(),
  requesterOther: z.string().optional(),
  hasShowedVerifiedDocument: z.boolean(),
  noSupportingDocumentationRequired: z.boolean(),
  attachments: z
    .array(
      z.object({
        type: z.string(),
        data: z.string()
      })
    )
    .default([]),
  payment: PaymentSchema.optional(),
  location: z.object({
    _fhirID: z.string()
  }),
  values: ChangedValuesInput,
  reason: z.string(),
  otherReason: z.string(),
  note: z.string()
})

export const MakeCorrectionRequestInput = CorrectionRequestInput
export const ApproveRequestInput = CorrectionRequestInput.extend({
  attachments: z
    .array(
      z.object({
        _fhirID: z.string()
      })
    )
    .default([]),
  payment: z
    .union([
      z.object({
        _fhirID: z.string()
      }),
      z.null()
    ])

    .optional()
})

export const CorrectionRejectionInput = z.object({
  reason: z.string()
})

export type ChangedValuesInput = z.infer<typeof ChangedValuesInput>
export type CorrectionRequestInput = z.infer<typeof CorrectionRequestInput>
export type PaymentInput = z.infer<typeof PaymentSchema>
export type CorrectionRejectionInput = z.infer<typeof CorrectionRejectionInput>
export type ApproveRequestInput = z.infer<typeof ApproveRequestInput>
export type MakeCorrectionRequestInput = z.infer<
  typeof MakeCorrectionRequestInput
>

export type CertifyInput = z.TypeOf<typeof CertifyRequestSchema>['certificate']
export type IssueInput = z.TypeOf<typeof IssueRequestSchema>['certificate']
