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
import { generateTranslationConfig } from '@opencrvs/commons/client'
import { computeInitialValues } from './useFormInitialValues'

// ---------------------------------------------------------------------------
// computeInitialValues
// ---------------------------------------------------------------------------

const emptyValidator = {} as ValidatorContext
const t = generateTranslationConfig

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
    { ...emptyValidator, baseFormState: { ...form, ...formValues } },
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
      label: t('a')
    }
    const fieldB: InteractiveFieldType = {
      id: 'b',
      type: FieldType.TEXT,
      required: false,
      defaultValue: 'b-default',
      conditionals: [
        { type: ConditionalType.SHOW, conditional: field('a').isEqualTo('yes') }
      ],
      label: t('b')
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
      label: t('a')
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
      label: t('a')
    }
    const fieldB: InteractiveFieldType = {
      id: 'b',
      type: FieldType.TEXT,
      required: false,
      conditionals: [],
      value: field('a'),
      label: t('b')
    }

    const result = run([fieldA, fieldB])

    expect(result['b']).toBe('synced-value')
  })

  it('intra-page derived default: field B defaultValue applied using field A default resolved in same pass', () => {
    // field A gets its defaultValue first; field B is only visible once A's value
    // is in the accumulated state, and then gets its own defaultValue applied.
    // This distinguishes intra-page accumulation from cross-page (baseFormState).
    const fieldA: InteractiveFieldType = {
      id: 'a',
      type: FieldType.TEXT,
      required: false,
      conditionals: [],
      defaultValue: 'a-default',
      label: t('a')
    }
    const fieldB: InteractiveFieldType = {
      id: 'b',
      type: FieldType.TEXT,
      required: false,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('a').isEqualTo('a-default')
        }
      ],
      defaultValue: 'b-default',
      label: t('b')
    }

    // No formValues and empty baseFormState — A and B both start unresolved.
    // B must see A's resolved default (not baseFormState) to become visible.
    const result = run([fieldA, fieldB], {}, {})

    expect(result['a']).toBe('a-default')
    expect(result['b']).toBe('b-default')
  })

  it('null form value is preserved and not overwritten by defaultValue', () => {
    const fieldA: InteractiveFieldType = {
      id: 'a',
      type: FieldType.TEXT,
      required: false,
      conditionals: [],
      defaultValue: 'should-not-be-used',
      label: t('a')
    }

    const result = run([fieldA], { a: null })

    expect(result['a']).toBeNull()
  })

  it('sync reference resolves value from baseFormState (previous page)', () => {
    // field A lives on a previous page (in baseFormState), not in the current page's fields
    const fieldB: InteractiveFieldType = {
      id: 'b',
      type: FieldType.TEXT,
      required: false,
      conditionals: [],
      value: field('a'),
      label: t('b')
    }

    const result = run([fieldB], {}, { a: 'from-previous-page' })

    expect(result['b']).toBe('from-previous-page')
  })
})
