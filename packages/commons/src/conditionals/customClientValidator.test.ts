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

import { createFieldConditionals as field } from './conditionals'
import { validate } from './validate'

/**
 * Tests for customClientValidator AJV keyword and toolkit method
 * 
 * This tests the end-to-end flow:
 * 1. Toolkit method serializes function via toString()
 * 2. JSON Schema contains serialized function string
 * 3. AJV keyword deserializes and executes function just-in-time
 * 4. Function receives (value, context) and returns boolean
 */
describe('customClientValidator', () => {
  const mockContext = {
    $form: {
      age: 25,
      'mother.dob': '1980-01-01',
      'child.dob': '2020-01-01'
    },
    $now: '2026-02-10',
    $online: true
  }

  describe('Toolkit API - field().customClientValidator()', () => {
    it('should serialize simple validation function', () => {
      const schema = field('age').customClientValidator((value: unknown) => {
        return typeof value === 'number' && value >= 18
      })

      expect(schema.$id).toBeDefined()
      expect(schema.$id).toContain('https://opencrvs.org/conditionals/')
    })

    it('should serialize function with context access', () => {
      const schema = field('child.dob').customClientValidator((value: unknown, ctx: any) => {
        const motherDob = ctx.$form['mother.dob']
        if (!motherDob || !value) return false
        return new Date(value as string) > new Date(motherDob)
      })

      expect(schema.$id).toBeDefined()
    })
  })

  describe('AJV Keyword Execution', () => {
    it('should pass validation when function returns true', () => {
      const schema = field('age').customClientValidator((value: unknown) => {
        return (value as number) >= 18
      })

      const result = validate(schema, mockContext)
      expect(result).toBe(true)
    })

    it('should fail validation when function returns false', () => {
      const schema = field('age').customClientValidator((value: unknown) => {
        return (value as number) >= 100 // Will fail for age=25
      })

      const result = validate(schema, mockContext)
      expect(result).toBe(false)
    })

    it('should access form values via context.$form', () => {
      const schema = field('child.dob').customClientValidator((value: unknown, ctx: any) => {
        const motherDob = ctx.$form['mother.dob']
        if (!motherDob || !value) return false
        return new Date(value as string) > new Date(motherDob)
      })

      const result = validate(schema, mockContext)
      expect(result).toBe(true) // child.dob (2020) > mother.dob (1980)
    })

    it('should access $now from context', () => {
      const schema = field('age').customClientValidator((value: unknown, ctx: any) => {
        // Verify ctx.$now exists and is a date string
        return ctx.$now && typeof ctx.$now === 'string' && (value as number) > 0
      })

      const result = validate(schema, mockContext)
      expect(result).toBe(true)
    })

    it('should fail gracefully when function throws exception', () => {
      const schema = field('age').customClientValidator((value: unknown) => {
        throw new Error('Intentional error')
      })

      const result = validate(schema, mockContext)
      expect(result).toBe(false) // Errors treated as invalid
    })

    it('should support complex validation logic', () => {
      const schema = field('age').customClientValidator((value: unknown, ctx: any) => {
        const age = value as number
        // Complex rule: age must be between 18 and 65, unless user is online
        if (ctx.$online) {
          return age >= 18
        } else {
          return age >= 18 && age <= 65
        }
      })

      const result = validate(schema, mockContext)
      expect(result).toBe(true) // Online, so only checking >= 18
    })

    it('should handle arrow function syntax', () => {
      const schema = field('age').customClientValidator((value: unknown) => (value as number) >= 18)

      const result = validate(schema, mockContext)
      expect(result).toBe(true)
    })

    it('should handle traditional function syntax', () => {
      const schema = field('age').customClientValidator(function(value: unknown) {
        return (value as number) >= 18
      })

      const result = validate(schema, mockContext)
      expect(result).toBe(true)
    })

    it('should treat empty schema string as always valid', () => {
      // Manually construct a schema with empty customClientValidator
      const schema = {
        $id: 'test-empty',
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              age: {
                customClientValidator: ''
              }
            },
            required: ['age']
          }
        },
        required: ['$form']
      }

      const result = validate(schema as any, mockContext)
      expect(result).toBe(true)
    })
  })

  describe('Type Safety', () => {
    it('should accept functions with correct signature', () => {
      // This test primarily verifies TypeScript compilation
      // If the code compiles, the types are correct
      const schema = field('age').customClientValidator(
        (value: unknown, context: any) => {
          return typeof value === 'number'
        }
      )

      expect(schema).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const schema = field('optionalField').customClientValidator((value: unknown) => {
        return value === null || (typeof value === 'string' && value.length > 0)
      })

      const contextWithNull = {
        ...mockContext,
        $form: { ...mockContext.$form, optionalField: null }
      }

      const result = validate(schema, contextWithNull)
      expect(result).toBe(true)
    })

    it('should handle boolean values', () => {
      const schema = field('consent').customClientValidator((value: unknown) => {
        return value === true
      })

      const contextWithBoolean = {
        ...mockContext,
        $form: { ...mockContext.$form, consent: true }
      }

      const result = validate(schema, contextWithBoolean)
      expect(result).toBe(true)
    })

    it('should handle object values', () => {
      const schema = field('address').customClientValidator((value: unknown) => {
        return typeof value === 'object' && value !== null && 'city' in value
      })

      const contextWithObject = {
        ...mockContext,
        $form: { ...mockContext.$form, address: { city: 'Dubai' } }
      }

      const result = validate(schema, contextWithObject)
      expect(result).toBe(true)
    })

    it('should handle array values', () => {
      const schema = field('tags').customClientValidator((value: unknown) => {
        return Array.isArray(value) && value.length > 0
      })

      const contextWithArray = {
        ...mockContext,
        $form: { ...mockContext.$form, tags: ['tag1', 'tag2'] }
      }

      const result = validate(schema, contextWithArray)
      expect(result).toBe(true)
    })
  })

  describe('Real-World Use Cases', () => {
    it('should validate age >= 18 for adult consent', () => {
      const schema = field('age').customClientValidator((value: unknown) => {
        return typeof value === 'number' && value >= 18
      })

      expect(validate(schema, { ...mockContext, $form: { age: 17 } })).toBe(false)
      expect(validate(schema, { ...mockContext, $form: { age: 18 } })).toBe(true)
      expect(validate(schema, { ...mockContext, $form: { age: 25 } })).toBe(true)
    })

    it('should validate child DOB is after mother DOB', () => {
      const schema = field('child.dob').customClientValidator((value: unknown, ctx: any) => {
        const motherDob = ctx.$form['mother.dob']
        if (!motherDob || !value) return false
        return new Date(value as string) > new Date(motherDob)
      })

      const validContext = {
        ...mockContext,
        $form: {
          'mother.dob': '1980-01-01',
          'child.dob': '2020-01-01'
        }
      }

      const invalidContext = {
        ...mockContext,
        $form: {
          'mother.dob': '2020-01-01',
          'child.dob': '1980-01-01'
        }
      }

      expect(validate(schema, validContext)).toBe(true)
      expect(validate(schema, invalidContext)).toBe(false)
    })

    it('should validate minimum 2 witnesses for marriage', () => {
      const schema = field('witnesses').customClientValidator((value: unknown) => {
        return Array.isArray(value) && value.length >= 2
      })

      const validContext = {
        ...mockContext,
        $form: {
          witnesses: ['John Doe', 'Jane Smith']
        }
      }

      const invalidContext = {
        ...mockContext,
        $form: {
          witnesses: ['John Doe']
        }
      }

      expect(validate(schema, validContext)).toBe(true)
      expect(validate(schema, invalidContext)).toBe(false)
    })

    it('should validate age difference between spouses', () => {
      const schema = field('spouse1.age').customClientValidator((value: unknown, ctx: any) => {
        const spouse2Age = ctx.$form['spouse2.age'] as number
        if (!spouse2Age || !value) return false
        const ageDiff = Math.abs((value as number) - spouse2Age)
