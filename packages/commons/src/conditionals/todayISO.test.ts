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

import { FieldConfig } from '../events/FieldConfig'
import { FieldType } from '../events/FieldType'
import { field } from '../events/field'
import { runFieldValidations, setCountryTimeZone, todayISO } from './validate'

/*
 * `setCountryTimeZone` sets a value for the whole module. These tests are in
 * their own file, so that the value does not change the results of other tests.
 */
describe('todayISO() and the time zone of the country', () => {
  const dobField: FieldConfig = {
    type: FieldType.DATE,
    id: 'child.dob',
    label: { id: 'child.dob.label', defaultMessage: 'DOB', description: '' },
    required: true,
    validation: [
      {
        validator: field('child.dob').isBefore().now(),
        message: {
          id: 'error.inFuture',
          defaultMessage: 'Must not be in the future',
          description: ''
        }
      }
    ]
  }

  function validateDob(value: string) {
    return runFieldValidations({
      field: dobField,
      value,
      form: { 'child.dob': value },
      context: {}
    })
  }

  beforeEach(() => {
    // 02:00 on 2 January in Asia/Dhaka (UTC+6), but still 1 January in UTC.
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2030-01-01T20:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns the date in the time zone of the country', () => {
    setCountryTimeZone('Asia/Dhaka')
    expect(todayISO()).toBe('2030-01-02')

    setCountryTimeZone('UTC')
    expect(todayISO()).toBe('2030-01-01')
  })

  it('accepts a date of birth that is today in the country', () => {
    setCountryTimeZone('Asia/Dhaka')
    expect(validateDob('2030-01-02')).toEqual([])
  })

  it('rejects the same date of birth in a country where it is still yesterday', () => {
    setCountryTimeZone('UTC')
    expect(validateDob('2030-01-02')).toHaveLength(1)
  })
})
