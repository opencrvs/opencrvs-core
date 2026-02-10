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

/**
 * Tests for customClientEvaluation toolkit method and CodeToEvaluate type
 */

import { describe, it, expect } from '@jest/globals'
import { field } from '../events/field'
import { isCodeToEvaluate } from '../client'

describe('customClientEvaluation', () => {
  describe('Toolkit API - field().customClientEvaluation()', () => {
    it('serialises a computation function correctly', () => {
      const result = field('fullName').customClientEvaluation((value: unknown, ctx: any) => {
        return `${ctx.$form.firstName} ${ctx.$form.lastName}`
      })

      expect(result).toHaveProperty('$$code')
      expect(typeof result.$$code).toBe('string')
      expect(result.$$code).toContain('ctx.$form.firstName')
      expect(result.$$code).toContain('ctx.$form.lastName')
    })

    it('serialises arrow function syntax', () => {
      const result = field('age').customClientEvaluation((value: unknown, ctx: any) => 
        Math.floor((Date.now() - new Date(ctx.$form.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      )

      expect(result.$$code).toContain('=>')
      expect(result.$$code).toContain('Date.now')
    })

    it('serialises function expression syntax', () => {
      const result = field('value').customClientEvaluation(function(value: unknown, ctx: any) {
        return value || ctx.$form.defaultValue
      })

      expect(result.$$code).toContain('function')
    })
  })

  describe('Type discrimination - isCodeToEvaluate()', () => {
    it('correctly identifies CodeToEvaluate objects', () => {
      const codeObj = field('test').customClientEvaluation((v: unknown) => v)
      expect(isCodeToEvaluate(codeObj)).toBe(true)
    })

    it('correctly discriminates CodeToEvaluate from FieldReference', () => {
      const fieldRef = { $$field: 'firstName' }
      const codeObj = { $$code: '(v) => v' }

      expect(isCodeToEvaluate(fieldRef)).toBe(false)
      expect(isCodeToEvaluate(codeObj)).toBe(true)
    })

    it('rejects non-CodeToEvaluate objects', () => {
      expect(isCodeToEvaluate(null)).toBe(false)
      expect(isCodeToEvaluate(undefined)).toBe(false)
      expect(isCodeToEvaluate({})).toBe(false)
      expect(isCodeToEvaluate({ code: 'test' })).toBe(false)
      expect(isCodeToEvaluate('string')).toBe(false)
      expect(isCodeToEvaluate(123)).toBe(false)
    })
  })

  describe('Client-side evaluation scenarios', () => {
    // Helper to simulate client-side evaluation
    function evaluateCode(codeToEval: { $$code: string }, value: unknown, context: any): any {
      try {
        const fn = new Function('value', 'context', `return (${codeToEval.$$code})(value, context)`)
        return fn(value, context)
      } catch (error) {
        return undefined
      }
    }

    it('can compute a value from context.$form fields', () => {
      const computation = field('fullName').customClientEvaluation((value: unknown, ctx: any) => {
        return `${ctx.$form.firstName} ${ctx.$form.lastName}`
      })

      const context = {
        $form: { firstName: 'John', lastName: 'Doe' }
      }

      const result = evaluateCode(computation, undefined, context)
      expect(result).toBe('John Doe')
    })

    it('can concatenate string fields', () => {
      const computation = field('address').customClientEvaluation((value: unknown, ctx: any) => {
        const parts = [ctx.$form.street, ctx.$form.city, ctx.$form.country].filter(Boolean)
        return parts.join(', ')
      })

      const context = {
        $form: { street: '123 Main St', city: 'London', country: 'UK' }
      }

      const result = evaluateCode(computation, undefined, context)
      expect(result).toBe('123 Main St, London, UK')
    })

    it('handles undefined field values gracefully', () => {
      const computation = field('fullName').customClientEvaluation((value: unknown, ctx: any) => {
        const first = ctx.$form.firstName || ''
        const last = ctx.$form.lastName || ''
        return [first, last].filter(Boolean).join(' ')
      })

      const context = {
        $form: { firstName: 'John' } // lastName is undefined
      }

      const result = evaluateCode(computation, undefined, context)
      expect(result).toBe('John')
    })

    it('returns undefined when computation function throws', () => {
      const computation = field('value').customClientEvaluation((value: unknown, ctx: any) => {
        throw new Error('Computation error')
      })

      const context = {
        $form: {}
      }

      const result = evaluateCode(computation, undefined, context)
      expect(result).toBeUndefined()
    })

    it('can access context.$now for time-based calculations', () => {
      const computation = field('age').customClientEvaluation((value: unknown, ctx: any) => {
        const dob = ctx.$form.dob
        if (!dob) return undefined
        return Math.floor((new Date(ctx.$now).getTime() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      })

      const context = {
        $form: { dob: '2000-01-01' },
        $now: '2026-01-01'
      }

      const result = evaluateCode(computation, undefined, context)
      expect(result).toBe(26)
    })

    it('can use the field value parameter', () => {
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

  describe('Regression test - FieldReference still works', () => {
    it('FieldReference objects are not affected by CodeToEvaluate implementation', () => {
      const fieldRef = { $$field: 'firstName', $$subfield: undefined }
      
      expect(isCodeToEvaluate(fieldRef)).toBe(false)
      expect(fieldRef).toHaveProperty('$$field')
      expect(fieldRef.$$field).toBe('firstName')
    })
  })
})
