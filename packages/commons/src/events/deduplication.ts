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

import {
  ClauseInput,
  DateRangeMatcherOptions,
  FuzzyMatcherOptions,
  StrictMatcherOptions
} from '.'

export function not(clause: ClauseInput): ClauseInput {
  return {
    type: 'not',
    clause
  }
}

export function and(...clauses: ClauseInput[]): ClauseInput {
  return {
    type: 'and',
    clauses
  }
}

export function or(...clauses: ClauseInput[]): ClauseInput {
  return {
    type: 'or',
    clauses
  }
}

export function field(fieldId: string) {
  return {
    fuzzyMatches: (options?: FuzzyMatcherOptions) =>
      ({
        fieldId,
        type: 'fuzzy',
        options
      }) satisfies ClauseInput,
    strictMatches: (options?: StrictMatcherOptions) =>
      ({
        fieldId,
        type: 'strict',
        options
      }) satisfies ClauseInput,
     /**
     * Creates a date range matcher that finds records where date field fall within a specified range.
     *
     * By default, matches against the field specified in `field()` (e.g., 'mother.dob').
     * When `matchAgainst` is provided, it overwrites the default field and searches against that field with OR logic .
     *
     * @param options - Configuration for the date range matching
     * @param options.days - Number of days before and after the target date to search (creates a ±days range)
     * @param options.pivot - Optional. Distance in days where relevance scoring drops by 50%. Defaults to ⌊(days * 2) / 3⌋
     * @param options.boost - Optional. Scoring boost multiplier for matching results. Defaults to 1
     * @param options.matchAgainst - Optional. Additional field to match against. When provided,
     * the query matches if the field fall within the date range. The default field is always excluded in the search in that case.
     *
     * @returns A clause that matches records where at least one of the specified date field is within the range
     *
     * @example
     * // Matches only against mother.dob (±365 days)
     * field('mother.dob').dateRangeMatches({ days: 365 })
     *
     * @example
     * // Matches against mother.age OR spouse.dob, not mother.dob
     * field('mother.dob').dateRangeMatches({
     *   days: 365,
     *   matchAgainst: $field('mother.age')
     * })
     *
     * @example
     * // With custom pivot and boost
     * field('mother.dob').dateRangeMatches({
     *   days: 730,
     *   pivot: 365,
     *   boost: 2
     * })
     */
    dateRangeMatches: (options: DateRangeMatcherOptions) =>
      ({
        fieldId,
        type: 'dateRange',
        options
      }) satisfies ClauseInput
  }
}
