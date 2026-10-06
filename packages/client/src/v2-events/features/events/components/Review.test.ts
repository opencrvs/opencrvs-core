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
  FieldConfig,
  FieldType,
  generateTranslationConfig
} from '@opencrvs/commons/client'
import { hasAnyDisplayedValue } from './Review'

const nameField = {
  id: 'member.name',
  type: FieldType.NAME,
  required: false,
  label: generateTranslationConfig('Member name')
} satisfies FieldConfig

const checkboxField = {
  id: 'member.exactDateUnknown',
  type: FieldType.CHECKBOX,
  required: false,
  defaultValue: false,
  label: generateTranslationConfig('Exact date unknown')
} satisfies FieldConfig

const numberField = {
  id: 'member.age',
  type: FieldType.NUMBER,
  required: false,
  label: generateTranslationConfig('Age')
} satisfies FieldConfig

const fields = [nameField, checkboxField, numberField]

describe('hasAnyDisplayedValue', () => {
  it('is false for what clearing a page leaves behind', () => {
    expect(
      hasAnyDisplayedValue(fields, {
        'member.name': { firstname: '', surname: '' },
        'member.exactDateUnknown': false,
        'member.age': null
      })
    ).toBe(false)
  })

  it('is false for an empty name with a middle name part', () => {
    expect(
      hasAnyDisplayedValue([nameField], {
        'member.name': { firstname: '', middlename: '', surname: '' }
      })
    ).toBe(false)
  })

  it('is false when nothing has been entered', () => {
    expect(hasAnyDisplayedValue(fields, {})).toBe(false)
  })

  it('is true for a partly filled name', () => {
    expect(
      hasAnyDisplayedValue([nameField], {
        'member.name': { firstname: '', surname: 'Lovelace' }
      })
    ).toBe(true)
  })

  it('is true for a checked checkbox', () => {
    expect(
      hasAnyDisplayedValue([checkboxField], { 'member.exactDateUnknown': true })
    ).toBe(true)
  })

  it('is true for a number', () => {
    expect(hasAnyDisplayedValue([numberField], { 'member.age': 34 })).toBe(true)
  })
})
