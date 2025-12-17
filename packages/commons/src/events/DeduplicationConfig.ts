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
import { TranslationConfig } from './TranslationConfig'

const FieldReference = z.string()

const Matcher = z.object({
  /**
   * Reference to the field used in matching.
   *
   * For `dateRange` type matcher the value of this field will also
   * be used as the origin date to calculate the distance from.
   */
  fieldId: FieldReference,
  options: z
    .object({
      boost: z.number().optional()
    })
    .optional()
    .default({
      boost: 1
    })
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
    .default({
      fuzziness: 'AUTO:4,7',
      boost: 1
    })
})

export type FuzzyMatcherOptions = z.input<typeof FuzzyMatcher>['options']

const StrictMatcher = Matcher.extend({
  type: z.literal('strict'),
  options: z
    .object({
      boost: z.number().optional().default(1),
      /**
       * The constant value to be present in the field for both records
       */
      value: z.string().optional()
    })
    .optional()
    .default({
      boost: 1
    })
})

export type StrictMatcherOptions = z.input<typeof StrictMatcher>['options']

const DateRangeMatcher = Matcher.extend({
  type: z.literal('dateRange'),
  options: z.object({
    /**
     * The distance pivot in days. Distance from the origin (the value of
     * fieldId) at which relevance scores receive half of the boost value
     */
    pivot: z.number().optional(),
    days: z.number(),
    boost: z.number().optional().default(1)
  })
})

export type DateRangeMatcherOptions = z.input<
  typeof DateRangeMatcher
>['options']

export type NotInput = {
  type: 'not'
  clause: ClauseInput
}

export type NotOutput = {
  type: 'not'
  clause: ClauseOutput
}

export type AndInput = {
  type: 'and'
  clauses: ClauseInput[]
}

export type AndOutput = {
  type: 'and'
  clauses: ClauseOutput[]
}

export type OrInput = {
  type: 'or'
  clauses: ClauseInput[]
}

export type OrOutput = {
  type: 'or'
  clauses: ClauseOutput[]
}

const Not = z.object({
  type: z.literal('not'),
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  clause: z.lazy(() => Clause)
})

const And = z.object({
  type: z.literal('and'),
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  clauses: z.lazy(() => Clause.array())
})

const Or = z.object({
  type: z.literal('or'),
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  clauses: z.lazy(() => Clause.array())
})

export type ClauseInput =
  | NotInput
  | AndInput
  | OrInput
  | z.input<typeof FuzzyMatcher>
  | z.input<typeof StrictMatcher>
  | z.input<typeof DateRangeMatcher>

export type ClauseOutput =
  | NotOutput
  | AndOutput
  | OrOutput
  | z.output<typeof FuzzyMatcher>
  | z.output<typeof StrictMatcher>
  | z.output<typeof DateRangeMatcher>

/**
 * Defines a deduplication clause. Clauses are either matcher clauses or logical clauses. Logical clauses (and, or) are used to combine multiple clauses.
 * Since the definiton is recursive, we use z.lazy to define the schema.
 * Zod supports recursive schemas, but needs help with Input and Output types.
 *
 * Default assumption is that the ZodType is the input. Markers use default values, so we need to explicitly define output type, too.
 *
 */
export const Clause: z.ZodType<ClauseOutput, ClauseInput> = z
  .lazy(() =>
    z.discriminatedUnion('type', [
      Not,
      And,
      Or,
      FuzzyMatcher,
      StrictMatcher,
      DateRangeMatcher
    ])
  )
  .meta({
    id: 'Clause'
  })

export type Clause = z.infer<typeof Clause>

export const DeduplicationConfig = z.object({
  id: z.string(),
  label: TranslationConfig,
  query: Clause
})

export type DeduplicationConfigInput = z.input<typeof DeduplicationConfig>
export type DeduplicationConfig = z.infer<typeof DeduplicationConfig>
