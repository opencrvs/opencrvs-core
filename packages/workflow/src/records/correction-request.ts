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
      oldValue: z.string(),
      newValue: z.string()
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
