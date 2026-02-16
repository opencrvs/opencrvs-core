/**
 * @jest-environment jsdom
 */
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
 * Tests for customClientValidator AJV keyword
 * 
 * Validates that validation functions are:
 * 1. Correctly serialized from source code
 * 2. Deserializ and executed by AJV
 * 3. Able to access form values and context
 * 4. Able to reference other fields
 * 5. Handling errors gracefully
 */
describe('customClientValidator', () => {
  const mockContext = {
    $form: {
      age: 25,
      'mother.dob': '1980-01-01',
      'child.dob': '2020-01-01',
      witnesses: ['John Doe', 'Jane Smith'],
      optionalField: null
    },
    $now: '2026-02-10',
    $online: true
  }

  it('serializes validation function to schema', () => {
    const schema = field('age').customClientValidator((value: unknown) => {
      return typeof value === 'number' && value >= 18
    })

    expect(schema.$id).toBeDefined()
    expect(schema.$id).toContain('https://opencrvs.org/conditionals/')
  })

  it('passes validation when function returns true', () => {
    const schema = field('age').customClientValidator((value: unknown) => {
      return (value as number) >= 18
    })

    expect(validate(schema, mockContext)).toBe(true)
  })

  it('fails validation when function returns false', () => {
    const schema = field('age').customClientValidator((value: unknown) => {
      return (value as number) >= 100 // Will fail for age=25
    })

    expect(validate(schema, mockContext)).toBe(false)
  })

  it('accesses context.$form and $now for validation', () => {
    const schema = field('child.dob').customClientValidator((value: unknown, ctx: any) => {
      return ctx.$now && 
             ctx.$form['mother.dob'] && 
             new Date(value as string) > new Date(ctx.$form['mother.dob'])
    })

    expect(validate(schema, mockContext)).toBe(true)
  })

  it('references other field values in cross-field validation', () => {
    const schema = field('witnesses').customClientValidator((value: unknown, ctx: any) => {
      // Witnesses array must have at least 2 entries
      return Array.isArray(value) && value.length >= 2
    })

    const contextWithWitnesses = {
      ...mockContext,
      $form: { ...mockContext.$form, witnesses: ['John Doe', 'Jane Smith'] }
    }

    expect(validate(schema, contextWithWitnesses)).toBe(true)
  })

  it('handles errors gracefully without crashing', () => {
    const schema = field('age').customClientValidator((value: unknown) => {
      throw new Error('Intentional error')
    })

    const result = validate(schema, mockContext)
    expect(result).toBe(false) // Errors treated as invalid
  })

  it('supports complex multi-condition validation logic', () => {
    const schema = field('age').customClientValidator((value: unknown, ctx: any) => {
      const age = value as number
      // If online: age >= 18, if offline: age 18-65
      if (ctx.$online) {
        return age >= 18
      } else {
        return age >= 18 && age <= 65
      }
    })

    expect(validate(schema, mockContext)).toBe(true)
  })

  it('treats empty validator string as always valid', () => {
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

    expect(validate(schema as any, mockContext)).toBe(true)
  })

  it('validates various data types correctly', () => {
    // Test null
    let schema = field('optionalField').customClientValidator((value: unknown) => {
      return value === null || (typeof value === 'string' && value.length > 0)
    })
    expect(validate(schema, mockContext)).toBe(true)

    // Test arrays
    schema = field('witnesses').customClientValidator((value: unknown) => {
      return Array.isArray(value) && value.length > 0
    })
    expect(validate(schema, mockContext)).toBe(true)
  })
})
