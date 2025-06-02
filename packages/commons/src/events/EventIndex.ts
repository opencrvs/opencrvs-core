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
import { EventMetadata, EventStatusEnum } from './EventMetadata'
import { EventState } from './ActionDocument'
import { extendZodWithOpenApi } from 'zod-openapi'
extendZodWithOpenApi(z)

export const EventIndex = EventMetadata.extend({
  declaration: EventState
}).openapi({
  ref: 'EventIndex'
})

export const EventSearchIndex = z
  .record(z.string(), z.any())
  .and(
    z.object({
      type: z.string() // Ensures "type" (event-id) exists and is a string
    })
  )
  .openapi({
    ref: 'EventSearchIndex'
  })

export type EventSearchIndex = z.infer<typeof EventSearchIndex>
export type EventIndex = z.infer<typeof EventIndex>

const Fuzzy = z.object({ type: z.literal('fuzzy'), term: z.string() }).openapi({
  ref: 'Fuzzy'
})
const Exact = z.object({ type: z.literal('exact'), term: z.string() }).openapi({
  ref: 'Exact'
})
const AnyOf = z
  .object({
    type: z.literal('anyOf'),
    terms: z.array(z.string())
  })
  .openapi({
    ref: 'AnyOf'
  })

const ExactStatus = z
  .object({
    type: z.literal('exact'),
    term: EventStatusEnum
  })
  .openapi({
    ref: 'ExactStatus'
  })

const AnyOfStatus = z
  .object({
    type: z.literal('anyOf'),
    terms: z.array(EventStatusEnum)
  })
  .openapi({
    ref: 'AnyOfStatus'
  })

const Range = z
  .object({
    type: z.literal('range'),
    gte: z.string(),
    lte: z.string()
  })
  .openapi({
    ref: 'Range'
  })
const Not = z.object({ type: z.literal('not'), term: z.string() }).openapi({
  ref: 'Not'
})

const Within = z
  .object({ type: z.literal('within'), location: z.string() })
  .openapi({
    ref: 'Within'
  })

const DateCondition = z.union([Exact, Range]).openapi({
  ref: 'DateCondition'
})

// Use `ZodType` here to avoid locking the output type prematurely —
// this keeps recursive inference intact and allows `z.infer<typeof QueryInput>` to work correctly.
export const QueryInput: ZodType = z
  .lazy(() =>
    z.union([
      z.discriminatedUnion('type', [Fuzzy, Exact, Range, Within, AnyOf, Not]),
      z.record(z.string(), QueryInput)
    ])
  )
  .openapi({
    ref: 'QueryInput'
  })
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

export const QueryExpression = z
  .object({
    eventType: z.string(),
    status: z.optional(z.union([AnyOfStatus, ExactStatus])),
    createdAt: z.optional(DateCondition),
    updatedAt: z.optional(DateCondition),
    'legalStatus.REGISTERED.createdAt': z.optional(DateCondition),
    'legalStatus.REGISTERED.createdAtLocation': z.optional(
      z.union([Within, Exact])
    ),
    createAtLocation: z.optional(z.union([Within, Exact])),
    updatedAtLocation: z.optional(z.union([Within, Exact])),
    createdBy: z.optional(Exact),
    updatedBy: z.optional(Exact),
    trackingId: z.optional(Exact),
    flags: z.optional(z.array(z.union([AnyOf, Not]))),
    data: QueryInput
  })
  .partial()
  .openapi({
    ref: 'QueryExpression'
  })

export const QueryType = z
  .object({
    type: z.literal('and').or(z.literal('or')).openapi({ default: 'and' }),
    clauses: z.preprocess(
      (val) => {
        // When `QueryType` is used as a query parameter in a REST API:

        // If `clauses` contains a single item, it may be sent as a JSON string instead of an array.
        // We wrap it in an array and parse it.
        if (typeof val === 'string') {
          return [JSON.parse(val)]
        }
        // If `clauses` contains multiple items, each item may still be sent as a separate JSON string.
        // We parse each string into its corresponding object.
        if (Array.isArray(val)) {
          return val.map((v) => (typeof v === 'string' ? JSON.parse(v) : v))
        }
        // If `clauses` is already passed correctly (e.g., via tRPC), we return it as-is.
        return val

        // This preprocessing ensures consistent handling of `clauses` regardless of how the client submits the data.
      },
      z.array(QueryExpression).openapi({
        default: [
          {
            eventType: 'tennis-club-membership',
            status: {
              type: 'anyOf',
              terms: [
                'CREATED',
                'NOTIFIED',
                'DECLARED',
                'VALIDATED',
                'REGISTERED',
                'CERTIFIED',
                'REJECTED',
                'ARCHIVED'
              ]
            },
            updatedAt: {
              type: 'range',
              gte: '2025-05-22',
              lte: '2025-05-29'
            },
            data: {}
          }
        ]
      })
    )
  })
  .openapi({
    ref: 'QueryType'
  })

export type QueryType = z.infer<typeof QueryType>
export type QueryExpression = z.infer<typeof QueryExpression>
