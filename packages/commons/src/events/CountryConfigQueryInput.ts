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
import { SerializedUserField } from './serializers/user/serializer'

const SerializableExact = z.object({
  type: z.literal('exact'),
  term: z.union([z.string(), SerializedUserField])
})

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
const QueryInput: ZodType = z.lazy(() =>
  z.union([
    z.discriminatedUnion('type', [Fuzzy, Exact, Range, Within, AnyOf, Not]),
    z.record(z.string(), QueryInput)
  ])
)

export const SerializedQueryExpression = z
  .object({
    type: z.literal('and'),
    title: z.string(),
    eventType: z.string(),
    status: z.optional(z.union([AnyOf, Exact])),
    createdAt: z.optional(DateCondition),
    updatedAt: z.optional(DateCondition),
    createAtLocation: z.optional(z.union([Within, Exact])),
    updatedAtLocation: z.optional(z.union([Within, Exact])),
    assignedTo: z.optional(SerializableExact),
    createdBy: z.optional(Exact),
    updatedBy: z.optional(Exact),
    trackingId: z.optional(Exact),
    flags: z.optional(z.array(z.union([AnyOf, Not]))),
    data: QueryInput
  })
  .partial()

const Or = z.object({
  type: z.literal('or'),
  clauses: z.array(SerializedQueryExpression)
})

export type SerializedQueryExpression = z.infer<
  typeof SerializedQueryExpression
>

export const CountryConfigQueryType = z.discriminatedUnion('type', [
  SerializedQueryExpression,
  Or
])
export type CountryConfigQueryType = z.infer<typeof CountryConfigQueryType>
