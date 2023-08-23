import { z } from 'zod'

export const CorrectionRequestInput = z.object({
  requester: z.string(),
  hasShowedVerifiedDocument: z.boolean(),
  noSupportingDocumentationRequired: z.boolean().optional(),
  payments: z
    .array(
      z.object({
        paymentId: z.string().optional(),
        type: z.string().optional(),
        total: z.number().optional(),
        amount: z.number().optional(),
        outcome: z.string().optional(),
        date: z.string().optional(),
        data: z.string().optional()
      })
    )
    .default([]),
  location: z.object({
    _fhirID: z.string()
  }),
  values: z
    .array(
      z.object({
        section: z.string().optional(),
        fieldName: z.string().optional(),
        oldValue: z.string().optional(),
        newValue: z.string().optional()
      })
    )
    .default([]),
  reason: z.string(),
  note: z.string(),
  otherReason: z.string()
})
export const CorrectionRejectionInput = z.object({
  reason: z.string()
})

export type CorrectionRequestInput = z.infer<typeof CorrectionRequestInput>
export type CorrectionRejectionInput = z.infer<typeof CorrectionRejectionInput>
