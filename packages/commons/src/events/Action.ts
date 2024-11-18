import { GetValues, NonEmptyArray } from 'src/types'
import { z } from 'zod'

// @TODO: UNIFY
export const ActionType = {
  CREATED: 'CREATED',
  ASSIGNMENT: 'ASSIGNMENT',
  UNASSIGNMENT: 'UNASSIGNMENT',
  REGISTERED: 'REGISTERED',
  VALIDATED: 'VALIDATED',
  CORRECTION: 'CORRECTION',
  DUPLICATES_DETECTED: 'DUPLICATES_DETECTED',
  NOTIFICATION: 'NOTIFICATION',
  DECLARATION: 'DECLARATION'
} as const

export const actionTypes = Object.values(ActionType)
export type ActionType = GetValues<typeof ActionType>

// @TODO: Go through
const ActionBase = z.object({
  type: z.enum(actionTypes as NonEmptyArray<ActionType>),
  createdAt: z.date(),
  createdBy: z.string(),
  fields: z.array(
    z.object({
      id: z.string(),
      value: z.union([
        z.string(),
        z.number(),
        z.array(
          z.object({
            optionValues: z.array(z.string()),
            type: z.string(),
            data: z.string(),
            fileSize: z.number()
          })
        )
      ])
    })
  )
})

export const Action = z.union([
  ActionBase.extend({
    type: z.enum([ActionType.CREATED])
  }),
  ActionBase.extend({
    type: z.enum([ActionType.REGISTERED]),
    identifiers: z.object({
      trackingId: z.string(),
      registrationNumber: z.string()
    })
  })
])

export type Action = z.infer<typeof Action>
