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
import { TranslationConfig } from './TranslationConfig'

const FieldReference = z.string()

const Matcher = z.object({
  fieldId: z.string(),
  options: z
    .object({
      boost: z.number().optional()
    })
    .optional()
    .default({})
})

const FuzzyMatcher = Matcher.extend({
  type: z.literal('fuzzy'),
  options: z
    .object({
      /**
       * Names of length 3 or less characters = 0 edits allowed
       * Names of length 4 - 6 characters = 1 edit allowed
       * Names of length >7 characters = 2 edits allowed
       */
      fuzziness: z
        .union([z.string(), z.number()])
        .optional()
        .default('AUTO:4,7'),
      boost: z.number().optional().default(1)
    })
    .optional()
    .default({})
})

const StrictMatcher = Matcher.extend({
  type: z.literal('strict'),
  options: z
    .object({
      boost: z.number().optional().default(1)
    })
    .optional()
    .default({})
})

const DateRangeMatcher = Matcher.extend({
  type: z.literal('dateRange'),
  options: z.object({
    days: z.number(),
    origin: FieldReference,
    boost: z.number().optional().default(1)
  })
})

const DateDistanceMatcher = Matcher.extend({
  type: z.literal('dateDistance'),
  options: z.object({
    days: z.number(),
    origin: FieldReference,
    boost: z.number().optional().default(1)
  })
})

export type And = {
  type: 'and'
  clauses: any[]
}

const And: z.ZodType<And> = z.object({
  type: z.literal('and'),
  clauses: z.lazy(() => Clause.array())
})

export type Or = {
  type: 'or'
  clauses: any[]
}

const Or: z.ZodType<Or> = z.object({
  type: z.literal('or'),
  clauses: z.lazy(() => Clause.array())
})

export type Clause =
  | And
  | Or
  | z.infer<typeof FuzzyMatcher>
  | z.infer<typeof StrictMatcher>
  | z.infer<typeof DateRangeMatcher>

export const Clause = z.union([
  And,
  Or,
  FuzzyMatcher,
  StrictMatcher,
  DateRangeMatcher,
  DateDistanceMatcher
])

export const DeduplicationConfig = z.object({
  id: z.string(),
  label: TranslationConfig,
  query: Clause
})

export type DeduplicationConfig = z.infer<typeof DeduplicationConfig>
