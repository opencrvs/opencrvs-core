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

export const CorrectionRequestPaymentInput = z.object({
  type: z.string(),
  amount: z.number(),
  outcome: z.string(),
  date: z.string().datetime(),
  attachmentData: z.string().optional()
})
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
  payment: CorrectionRequestPaymentInput.optional(),
  location: z.object({
    _fhirID: z.string()
  }),
  values: z.array(
    z.object({
      section: z.string(),
      fieldName: z.string(),
      oldValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
      newValue: z.union([z.string(), z.number(), z.boolean()])
    })
  ),
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

export type CorrectionRequestInput = z.infer<typeof CorrectionRequestInput>
export type CorrectionRequestPaymentInput = z.infer<
  typeof CorrectionRequestPaymentInput
>
export type CorrectionRejectionInput = z.infer<typeof CorrectionRejectionInput>
export type ApproveRequestInput = z.infer<typeof ApproveRequestInput>
export type MakeCorrectionRequestInput = z.infer<
  typeof MakeCorrectionRequestInput
>
