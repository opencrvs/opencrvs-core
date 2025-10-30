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

import * as z from 'zod/v4'
import { EventMetadata, EventStatus, Flag } from './EventMetadata'
import { EventState } from './ActionDocument'

import { TENNIS_CLUB_MEMBERSHIP } from './Constants'
import { TokenUserType } from '../authentication'
import { SelectDateRangeValue } from './FieldValue'
import { ZodType } from 'zod/v4'

export const EventIndex = EventMetadata.extend({
  declaration: EventState
}).meta({
  id: 'EventIndex'
})

export const EventSearchIndex = z
  .record(z.string(), z.any())
  .and(
    z.object({
      type: z.string() // Ensures "type" (event-id) exists and is a string
    })
  )
  .meta({
    id: 'EventSearchIndex'
  })

export type EventSearchIndex = z.infer<typeof EventSearchIndex>
export type EventIndex = z.infer<typeof EventIndex>

export const Fuzzy = z
  .object({ type: z.literal('fuzzy'), term: z.string() })
  .meta({
    id: 'Fuzzy'
  })

export const Exact = z
  .object({ type: z.literal('exact'), term: z.string() })
  .meta({
    id: 'Exact'
  })

export const ExactStatus = z
  .object({
    type: z.literal('exact'),
    term: EventStatus
  })
  .meta({
    id: 'ExactStatus'
  })

export const ExactUserType = z
  .object({
    type: z.literal('exact'),
    term: TokenUserType
  })
  .meta({
    id: 'ExactUserType'
  })

export const AnyOf = z
  .object({
    type: z.literal('anyOf'),
    terms: z.array(z.string())
  })
  .meta({
    id: 'AnyOf'
  })

export const AnyOfStatus = z
  .object({
    type: z.literal('anyOf'),
    terms: z.array(EventStatus)
  })
  .meta({
    id: 'AnyOfStatus'
  })

export const Range = z
  .object({
    type: z.literal('range'),
    gte: z.string(),
    lte: z.string()
  })
  .meta({
    id: 'Range'
  })

export const ContainsFlags = z
  .object({
    anyOf: z.array(Flag).optional(),
    noneOf: z.array(Flag).optional()
  })
  .meta({
    id: 'ContainsFlags'
  })

export const Within = z
  .object({ type: z.literal('within'), location: z.string() })
  .meta({
    id: 'Within'
  })

const RangeDate = z
  .object({
    type: z.literal('range'),
    gte: z.iso.date().or(z.iso.datetime()),
    lte: z.iso.date().or(z.iso.datetime())
  })
  .meta({ id: 'RangeDate' })

export const ExactDate = Exact.extend({
  term: z.iso.date().or(z.iso.datetime())
}).meta({
  id: 'ExactDate'
})

const TimePeriod = z
  .object({
    type: z.literal('timePeriod'),
    term: SelectDateRangeValue
  })
  .meta({
    id: 'TimePeriod'
  })

export const DateCondition = z.union([ExactDate, RangeDate, TimePeriod]).meta({
  id: 'DateCondition'
})

export type DateCondition = z.infer<typeof DateCondition>

// Use `ZodType` here to avoid locking the output type prematurely —
// this keeps recursive inference intact and allows `z.infer<typeof QueryInput>` to work correctly.
export const QueryInput: ZodType = z
  .lazy(() =>
    z.union([
      z.discriminatedUnion('type', [Fuzzy, Exact, Range, Within, AnyOf]),
      z.record(z.string(), QueryInput)
    ])
  )
  .meta({
    id: 'QueryInput'
  })
export type BaseInput =
  | z.infer<typeof Fuzzy>
  | z.infer<typeof Exact>
  | z.infer<typeof Range>
  | z.infer<typeof Within>
  | z.infer<typeof AnyOf>

type QueryMap = {
  [key: string]: BaseInput | QueryMap
}

// This is a recursive type that can be used to represent nested query structures
// where each key can be a string and the value can be either a base input or another query map.
export type QueryInputType = BaseInput | QueryMap

export const QueryExpression = z
  .object({
    id: z.optional(z.string()),
    eventType: z.string(),
    status: z.optional(z.union([AnyOfStatus, ExactStatus])),
    createdAt: z.optional(DateCondition),
    updatedAt: z.optional(DateCondition),
    'legalStatuses.REGISTERED.acceptedAt': z.optional(DateCondition),
    'legalStatuses.DECLARED.createdAtLocation': z.optional(
      z.union([Within, Exact])
    ),
    'legalStatuses.REGISTERED.createdAtLocation': z.optional(
      z.union([Within, Exact])
    ),
    'legalStatuses.REGISTERED.registrationNumber': z.optional(Exact),
    createdAtLocation: z.optional(z.union([Within, Exact])),
    updatedAtLocation: z.optional(z.union([Within, Exact])),
    assignedTo: z.optional(Exact),
    createdByUserType: z.optional(ExactUserType),
    createdBy: z.optional(Exact),
    updatedBy: z.optional(Exact),
    trackingId: z.optional(Exact),
    flags: z.optional(ContainsFlags),
    // @todo: The type for this comes out as "any"
    data: QueryInput
  })
  .partial()
  .refine((obj) => Object.values(obj).some((val) => val !== undefined), {
    error: 'At least one query field must be specified.'
  })
  .meta({
    id: 'QueryExpression'
  })

// Use `ZodType` here to avoid locking the output type prematurely —
// this keeps recursive inference intact and allows `z.infer<typeof QueryType>` to work correctly.
export type QueryTypeShape = {
  type: 'and' | 'or'
  clauses: Array<z.infer<typeof QueryExpression> | QueryTypeShape>
}
export const QueryType: z.ZodType<QueryTypeShape> = z
  .lazy(() =>
    z.object({
      type: z.literal('and').or(z.literal('or')).meta({ default: 'and' }),
      clauses: z
        .array(z.union([QueryExpression, QueryType]))
        .nonempty('At least one clause is required.')
        .meta({
          default: [
            {
              eventType: TENNIS_CLUB_MEMBERSHIP,
              status: {
                type: 'anyOf',
                terms: EventStatus.options
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
    })
  )
  .meta({
    id: 'QueryType'
  })

function parseStringifiedQueryField(val: unknown) {
  if (typeof val === 'string') {
    return JSON.parse(val)
  }
  return val
}

export const SearchQuery = z
  .object({
    query: z.preprocess(parseStringifiedQueryField, QueryType).meta({
      default: {
        type: 'and',
        clauses: [
          {
            eventType: TENNIS_CLUB_MEMBERSHIP,
            status: {
              type: 'anyOf',
              terms: EventStatus.options
            },
            updatedAt: {
              type: 'range',
              gte: '2025-05-22',
              lte: '2025-05-29'
            },
            data: {}
          }
        ]
      }
    }),
    limit: z.number().optional().default(100),
    offset: z.number().optional().default(0),
    sort: z
      .preprocess(
        parseStringifiedQueryField,
        z.array(
          z.object({
            field: z.string(),
            direction: z.enum(['asc', 'desc']).default('asc')
          })
        )
      )
      .optional()
  })
  .meta({
    id: 'SearchQuery'
  })

export type SearchQuery = z.infer<typeof SearchQuery>

export type QueryType = z.infer<typeof QueryType>
export type QueryExpression = z.infer<typeof QueryExpression>

export const SearchScopeAccessLevels = {
  MY_JURISDICTION: 'my-jurisdiction',
  ALL: 'all'
} as const

export type SearchScopeAccessLevels =
  (typeof SearchScopeAccessLevels)[keyof typeof SearchScopeAccessLevels]
