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

import { describe, it, expect } from '@jest/globals'
import { field } from '../events/field'
import { isCodeToEvaluate } from '../client'

/**
 * Tests for customClientEvaluation and CodeToEvaluate
 * 
 * Validates that evaluation functions are:
 * 1. Correctly serialized to CodeToEvaluate type
 * 2. Correctly discriminated from FieldReference
 * 3. Able to access form context and compute values
 * 4. Handling errors gracefully
 */
describe('customClientEvaluation', () => {
  // Helper to simulate client-side evaluation
  function evaluateCode(codeToEval: { $$code: string }, value: unknown, context: any): any {
    try {
      const fn = new Function('value', 'context', `return (${codeToEval.$$code})(value, context)`)
      return fn(value, context)
    } catch (error) {
      return undefined
    }
  }

  it('serializes computation function to CodeToEvaluate', () => {
    const result = field('fullName').customClientEvaluation((value: unknown, ctx: any) => {
      return `${ctx.$form.firstName} ${ctx.$form.lastName}`
    })

    expect(result).toHaveProperty('$$code')
    expect(typeof result.$$code).toBe('string')
    expect(result.$$code).toContain('firstName')
    expect(result.$$code).toContain('lastName')
  })

  it('discriminates CodeToEvaluate from FieldReference via isCodeToEvaluate()', () => {
    const codeObj = { $$code: '(v) => v' }
    const fieldRef = { $$field: 'firstName' }

    expect(isCodeToEvaluate(codeObj)).toBe(true)
    expect(isCodeToEvaluate(fieldRef)).toBe(false)
    expect(isCodeToEvaluate(null)).toBe(false)
    expect(isCodeToEvaluate({})).toBe(false)
  })

  it('computes values from context.$form and context.$now', () => {
    // Test full name concatenation
    let computation = field('fullName').customClientEvaluation((value: unknown, ctx: any) => {
      return `${ctx.$form.firstName} ${ctx.$form.lastName}`
    })
    let result = evaluateCode(computation, undefined, {
      $form: { firstName: 'John', lastName: 'Doe' }
    })
    expect(result).toBe('John Doe')

    // Test time-based calculation
    computation = field('age').customClientEvaluation((value: unknown, ctx: any) => {
      const dob = ctx.$form.dob
      if (!dob) return undefined
      return Math.floor((new Date(ctx.$now).getTime() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    })
    result = evaluateCode(computation, undefined, {
      $form: { dob: '2000-01-01' },
      $now: '2026-01-01'
    })
    expect(result).toBe(26)
  })

  it('handles errors and missing values gracefully', () => {
    // Test error handling
    let computation = field('value').customClientEvaluation((value: unknown, ctx: any) => {
      throw new Error('Computation error')
    })
    expect(evaluateCode(computation, undefined, { $form: {} })).toBeUndefined()

    // Test missing field handling
    computation = field('fullName').customClientEvaluation((value: unknown, ctx: any) => {
      const first = ctx.$form.firstName || ''
      const last = ctx.$form.lastName || ''
      return [first, last].filter(Boolean).join(' ')
    })
    const result = evaluateCode(computation, undefined, {
      $form: { firstName: 'John' } // lastName missing
    })
    expect(result).toBe('John')
  })

  it('receives and transforms the field value parameter', () => {
    const computation = field('uppercaseName').customClientEvaluation((value: unknown, ctx: any) => {
      if (typeof value === 'string') {
        return value.toUpperCase()
      }
      return value
    })

    const result = evaluateCode(computation, 'john doe', { $form: {} })
    expect(result).toBe('JOHN DOE')
  })
})
