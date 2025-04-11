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

export const EventIndex = EventMetadata.extend({
  declaration: z.record(z.string(), z.any())
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

const Within = z.object({ type: z.literal('within'), location: z.string() })

const DateCondition = z.union([Exact, Range])

// Use `ZodType` here to avoid locking the output type prematurely —
// this keeps recursive inference intact and allows `z.infer<typeof QueryInput>` to work correctly.
export const QueryInput: ZodType = z.lazy(() =>
  z.union([
    z.discriminatedUnion('type', [Fuzzy, Exact, Range, Within, AnyOf]),
    z.record(z.string(), QueryInput)
  ])
)
// @ts-expect-error - recursive type definition
export type QueryInputType =
  | z.infer<typeof Fuzzy>
  | z.infer<typeof Exact>
  | z.infer<typeof Range>
  | z.infer<typeof Within>
  | z.infer<typeof AnyOf>
  | Record<string, QueryInputType>

const QueryExpression = z
  .object({
    eventType: z.string(),
    searchType: z.optional(z.union([AnyOf, Exact])),
    status: z.optional(z.union([AnyOf, Exact])),
    createdAt: z.optional(DateCondition),
    updatedAt: z.optional(DateCondition),
    createAtLocation: z.optional(z.union([Within, Exact])),
    updatedAtLocation: z.optional(z.union([Within, Exact])),
    createdBy: z.optional(Exact),
    updatedBy: z.optional(Exact),
    trackingId: z.optional(Exact),
    data: QueryInput
  })
  .partial()

const Or = z
  .object({
    type: z.literal('or'),
    clauses: z.array(QueryExpression)
  })
  .partial()

export const QueryType = z.union([QueryExpression, Or])
export type QueryType = z.infer<typeof QueryType>
