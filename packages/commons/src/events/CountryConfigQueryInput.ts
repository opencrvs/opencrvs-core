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
import { SerializedUserField } from './serializers/user/serializer'
import {
  AnyOfStatus,
  ContainsFlags,
  DateCondition,
  Exact,
  ExactStatus,
  QueryInput,
  Within,
  ExactUserType
} from './EventIndex'

const SerializableExact = z.object({
  type: z.literal('exact'),
  term: z.union([z.string(), SerializedUserField])
})

const SerializableWithin = z.object({
  type: z.literal('within'),
  location: z.union([z.string(), SerializedUserField])
})

export const SerializedQueryExpression = z
  .object({
    eventType: z.string(),
    status: z.optional(z.union([AnyOfStatus, ExactStatus])),
    createdAt: z.optional(DateCondition),
    updatedAt: z.optional(DateCondition),
    'legalStatuses.REGISTERED.createdAt': z.optional(DateCondition),
    'legalStatuses.REGISTERED.createdAtLocation': z.optional(
      z.union([Within, Exact])
    ),
    'legalStatuses.REGISTERED.registrationNumber': z.optional(Exact),
    createdAtLocation: z.optional(
      z.union([SerializableWithin, SerializableExact])
    ),
    updatedAtLocation: z.optional(
      z.union([SerializableWithin, SerializableExact])
    ),
    assignedTo: z.optional(SerializableExact),
    createdBy: z.optional(SerializableExact),
    createdByUserType: ExactUserType,
    updatedBy: z.optional(SerializableExact),
    trackingId: z.optional(Exact),
    flags: z.optional(ContainsFlags),
    data: QueryInput
  })
  .partial()

const Or = z.object({
  type: z.literal('or'),
  clauses: z.array(SerializedQueryExpression)
})

const And = z.object({
  type: z.literal('and'),
  clauses: z.array(SerializedQueryExpression)
})

export type SerializedQueryExpression = z.infer<
  typeof SerializedQueryExpression
>

export const CountryConfigQueryType = z.discriminatedUnion('type', [And, Or])
export type CountryConfigQueryType = z.infer<typeof CountryConfigQueryType>

export const CountryConfigQueryInputType = z.union([
  SerializedQueryExpression,
  And,
  Or
])
export type CountryConfigQueryInputType = z.infer<
  typeof CountryConfigQueryInputType
>
