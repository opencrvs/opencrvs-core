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
import { describe, test, expect } from 'vitest'
import {
  FieldConfig,
  FieldType,
  FieldValue,
  generateTranslationConfig
} from '@opencrvs/commons/client'
import { emptyValueToNull } from './emptyValueToNull'

const textField = {
  id: 'applicant.firstname',
  type: FieldType.TEXT,
  label: generateTranslationConfig('First name')
} as FieldConfig

const nameField = {
  id: 'applicant.name',
  type: FieldType.NAME,
  label: generateTranslationConfig('Name')
} as FieldConfig

describe('emptyValueToNull', () => {
  test('returns null when a filled simple field is cleared', () => {
    expect(emptyValueToNull(textField, 'Jane', '')).toBeNull()
    expect(emptyValueToNull(textField, 'Jane', undefined)).toBeNull()
  })

  test('returns null when a filled complex (NAME) field is cleared', () => {
    expect(
      emptyValueToNull(
        nameField,
        { firstname: 'Jane', surname: 'Doe' } as FieldValue,
        { firstname: '', surname: '' } as FieldValue
      )
    ).toBeNull()
  })

  test('keeps the new value when it is not empty', () => {
    expect(emptyValueToNull(textField, 'Jane', 'Janet')).toBe('Janet')
    expect(emptyValueToNull(textField, undefined, 'Jane')).toBe('Jane')
  })

  test('leaves a never-filled field as-is (undefined, not null)', () => {
    expect(emptyValueToNull(textField, undefined, '')).toBe('')
    expect(emptyValueToNull(textField, undefined, undefined)).toBeUndefined()
  })
})
