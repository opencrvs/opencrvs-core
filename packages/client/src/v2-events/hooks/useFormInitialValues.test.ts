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
  ConditionalType,
  EventState,
  field,
  FieldConfig,
  FieldType,
  FieldValue,
  InteractiveFieldType,
  ValidatorContext
} from '@opencrvs/commons/client'
import { computeInitialValues } from './useFormInitialValues'

// ---------------------------------------------------------------------------
// computeInitialValues
// ---------------------------------------------------------------------------

const emptyValidator = {} as ValidatorContext

/** Stub that returns the raw string defaultValue, or undefined. */
function stubGetDefaultValue(f: FieldConfig): FieldValue | undefined {
  if (!(`defaultValue` in f)) {
    return undefined
  }
  return typeof f.defaultValue === 'string' ? f.defaultValue : undefined
}

function run(
  fields: FieldConfig[],
  formValues: EventState = {},
  form: EventState = {}
) {
  return computeInitialValues(
    fields,
    formValues,
    { ...emptyValidator, baseFormState: form },
    stubGetDefaultValue
  )
}

describe('computeInitialValues', () => {
  it('cumulative visibility: field B is visible because field A default is accumulated', () => {
    const fieldA: InteractiveFieldType = {
      id: 'a',
      type: FieldType.TEXT,
      required: false,
      conditionals: [],
      defaultValue: 'yes',
      label: { id: 'a', defaultMessage: 'A', description: '' }
    }
    const fieldB: InteractiveFieldType = {
      id: 'b',
      type: FieldType.TEXT,
      required: false,
      defaultValue: 'b-default',
      conditionals: [
        { type: ConditionalType.SHOW, conditional: field('a').isEqualTo('yes') }
      ],
      label: { id: 'b', defaultMessage: 'B', description: '' }
    }

    const result = run([fieldA, fieldB])

    expect(result['a']).toBe('yes')
    expect(result['b']).toBe('b-default')
  })

  it('formValues takes precedence over defaultValue', () => {
    const fieldA: InteractiveFieldType = {
      id: 'a',
      type: FieldType.TEXT,
      required: false,
      conditionals: [],
      defaultValue: 'default',
      label: { id: 'a', defaultMessage: 'A', description: '' }
    }

    const result = run([fieldA], { a: 'user-value' })

    expect(result['a']).toBe('user-value')
  })

  it('sync reference resolves value from accumulated state', () => {
    const fieldA: InteractiveFieldType = {
      id: 'a',
      type: FieldType.TEXT,
      required: false,
      conditionals: [],
      defaultValue: 'synced-value',
      label: { id: 'a', defaultMessage: 'A', description: '' }
    }
    const fieldB: InteractiveFieldType = {
      id: 'b',
      type: FieldType.TEXT,
      required: false,
      conditionals: [],
      value: field('a'),
      label: { id: 'b', defaultMessage: 'B', description: '' }
    }

    const result = run([fieldA, fieldB])

    expect(result['b']).toBe('synced-value')
  })
})
