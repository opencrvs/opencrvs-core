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
    dateRangeMatches: (options: DateRangeMatcherOptions) =>
      ({
        fieldId,
        type: 'dateRange',
        options
      }) satisfies ClauseInput
  }
}
