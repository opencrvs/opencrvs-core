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
function OneOf<T extends z.ZodTypeAny>(type: T) {
  return z.object({ type: z.literal('oneOf'), terms: z.array(type) })
}
function Range<T extends z.ZodTypeAny>(type: T) {
  return z.object({ type: z.literal('range'), gte: type, lte: type })
}
const Within = z.object({ type: z.literal('within'), location: z.string() })

const DateCondition = z.union([Exact, Range(z.string())])
function Condition<T extends z.ZodTypeAny>(type: T) {
  return z.union([Fuzzy, Exact, OneOf(type), Range(type)])
}

// Recursive DataCondition
const DataConditionSchema: z.ZodType<any> = z.lazy(() =>
  z.record(z.union([Condition(z.any()), DataConditionSchema]))
)
export type DataCondition = z.infer<typeof DataConditionSchema>

const QueryExpression = z
  .object({
    searchType: z.optional(z.union([OneOf(z.string()), Exact])),
    eventType: z.string(),
    status: z.optional(z.union([OneOf(z.string()), Exact])),
    createdAt: z.optional(DateCondition),
    updatedAt: z.optional(DateCondition),
    createAtLocation: z.optional(z.union([Within, Exact])),
    updatedAtLocation: z.optional(z.union([Within, Exact])),
    createdBy: z.optional(Exact),
    updatedBy: z.optional(Exact),
    trackingId: z.optional(Exact),
    data: z.optional(z.record(DataConditionSchema))
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
