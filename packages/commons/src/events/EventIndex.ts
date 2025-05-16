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

import { z, ZodType } from 'zod'
import { EventMetadata } from './EventMetadata'
import { EventState } from './ActionDocument'

export const EventIndex = EventMetadata.extend({
  declaration: EventState
})

export const EventSearchIndex = z.record(z.string(), z.any()).and(
  z.object({
    type: z.string() // Ensures "type" (event-id) exists and is a string
  })
)

export type EventSearchIndex = z.infer<typeof EventSearchIndex>
export type EventIndex = z.infer<typeof EventIndex>

const Fuzzy = z.object({ type: z.literal('fuzzy'), term: z.string() })
const Exact = z.object({ type: z.literal('exact'), term: z.string() })
const AnyOf = z.object({
  type: z.literal('anyOf'),
  terms: z.array(z.string())
})

const Range = z.object({
  type: z.literal('range'),
  gte: z.string(),
  lte: z.string()
})
const Not = z.object({ type: z.literal('not'), term: z.string() })

const Within = z.object({ type: z.literal('within'), location: z.string() })

const DateCondition = z.union([Exact, Range])

// Use `ZodType` here to avoid locking the output type prematurely —
// this keeps recursive inference intact and allows `z.infer<typeof QueryInput>` to work correctly.
export const QueryInput: ZodType = z.lazy(() =>
  z.union([
    z.discriminatedUnion('type', [Fuzzy, Exact, Range, Within, AnyOf, Not]),
    z.record(z.string(), QueryInput)
  ])
)
export type BaseInput =
  | z.infer<typeof Fuzzy>
  | z.infer<typeof Exact>
  | z.infer<typeof Range>
  | z.infer<typeof Within>
  | z.infer<typeof AnyOf>
  | z.infer<typeof Not>

type QueryMap = {
  [key: string]: BaseInput | QueryMap
}

// This is a recursive type that can be used to represent nested query structures
// where each key can be a string and the value can be either a base input or another query map.
export type QueryInputType = BaseInput | QueryMap

const QueryExpression = z
  .object({
    type: z.literal('and'),
    eventType: z.string(),
    status: z.optional(z.union([AnyOf, Exact])),
    createdAt: z.optional(DateCondition),
    updatedAt: z.optional(DateCondition),
    createAtLocation: z.optional(z.union([Within, Exact])),
    updatedAtLocation: z.optional(z.union([Within, Exact])),
    createdBy: z.optional(Exact),
    updatedBy: z.optional(Exact),
    trackingId: z.optional(Exact),
    flags: z.optional(z.array(z.union([AnyOf, Not]))),
    data: QueryInput
  })
  .partial()

const Or = z.object({
  type: z.literal('or'),
  clauses: z.array(QueryExpression)
})

export type QueryExpression = z.infer<typeof QueryExpression>

export const QueryType = z.discriminatedUnion('type', [QueryExpression, Or])
export type QueryType = z.infer<typeof QueryType>
