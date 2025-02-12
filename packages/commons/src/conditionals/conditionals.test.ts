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

import { validate } from './validate'
import { and, or, field, not, ConditionalParameters } from './conditionals'
import { formatISO } from 'date-fns'

const params = {
  $form: {
    'applicant.name': 'John Doe',
    'applicant.dob': '1990-01-02'
  },
  $now: formatISO(new Date(), { representation: 'date' })
} satisfies ConditionalParameters

describe('Validate conditionals', () => {
  it('validates "and" conditional', () => {
    expect(
      validate(
        and(
          field('applicant.name').isEqualTo('John Doe'),
          field('applicant.dob').isAfter().date('1989-01-01')
        ),
        params
      )
    ).toBe(true)

    expect(
      validate(
        and(
          field('applicant.name').isEqualTo('John Doe'),
          field('applicant.dob').isAfter().date('1991-01-01')
        ),
        params
      )
    ).toBe(false)
  })

  it('validates "or" conditional', () => {
    expect(
      validate(
        or(
          field('applicant.name').isEqualTo('John Doe'),
          field('applicant.dob').isAfter().date('1989-01-01')
        ),
        params
      )
    ).toBe(true)

    expect(
      validate(
        or(
          field('applicant.name').isEqualTo('John Doe'),
          field('applicant.dob').isAfter().date('1991-01-01')
        ),
        params
      )
    ).toBe(true)

    expect(
      validate(
        or(
          field('applicant.name').isEqualTo('Jack Doe'),
          field('applicant.dob').isAfter().date('1991-01-01')
        ),
        params
      )
    ).toBe(false)
  })

  it('validates "not" conditional', () => {
    expect(
      validate(not(field('applicant.name').isEqualTo('John Doe')), params)
    ).toBe(false)

    expect(
      validate(not(field('applicant.name').isEqualTo('Jack Doe')), params)
    ).toBe(true)
  })

  it('validates "field.isAfter" conditional', () => {
    expect(
      validate(field('applicant.dob').isAfter().date('1990-01-03'), params)
    ).toBe(false)

    // seems to be inclusive
    expect(
      validate(field('applicant.dob').isAfter().date('1990-01-02'), params)
    ).toBe(true)

    expect(
      validate(field('applicant.dob').isAfter().date('1990-01-01'), params)
    ).toBe(true)
  })

  it('validates "field.isBefore" conditional', () => {
    expect(
      validate(field('applicant.dob').isBefore().date('1990-01-03'), params)
    ).toBe(true)

    // seems to be exclusive
    expect(
      validate(field('applicant.dob').isBefore().date('1990-01-02'), params)
    ).toBe(true)

    expect(
      validate(field('applicant.dob').isBefore().date('1990-01-01'), params)
    ).toBe(false)
  })

  it('validates "field.isEqualTo" conditional', () => {
    expect(
      validate(field('applicant.name').isEqualTo('John Doe'), params)
    ).toBe(true)
    expect(
      validate(field('applicant.name').isEqualTo('Jane Doe'), params)
    ).toBe(false)
  })

  it('validates "field.isUndefined" conditional', () => {
    expect(validate(field('applicant.name').isUndefined(), params)).toBe(false)
    expect(validate(field('applicant.name.foo').isUndefined(), params)).toBe(
      true
    )
  })

  it('validates "field.inArray" conditional', () => {
    expect(
      validate(
        field('applicant.name').inArray(['Jack Doe', 'Jane Doe']),
        params
      )
    ).toBe(false)
    expect(
      validate(
        field('applicant.name').inArray(['John Doe', 'Jane Doe']),
        params
      )
    ).toBe(true)
  })
})
