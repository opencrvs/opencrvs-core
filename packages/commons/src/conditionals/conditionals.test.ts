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
import {
  user,
  and,
  or,
  not,
  ConditionalParameters,
  UserConditionalParameters,
  EventConditionalParameters,
  FormConditionalParameters
} from './conditionals'
import { formatISO } from 'date-fns'
import { SCOPES } from '../scopes'
import { ActionType } from '../events/ActionType'
import { ActionStatus, EventState } from '../events/ActionDocument'
import { field } from '../events/field'
import { event } from '../events/event'
import { TokenUserType } from '../authentication'
import { UUID } from '../uuid'

/*  eslint-disable max-lines */

const DEFAULT_FORM = {
  'applicant.name': 'John Doe',
  'applicant.dob': '1990-01-02',
  'applicant.address': {
    country: 'FAR',
    addressType: 'DOMESTIC',
    administrativeArea: undefined,
    streetLevelDetails: {
      addressLine1: 'Example Town',
      addressLine2: 'Example Residential Area',
      addressLine3: 'Example Street',
      addressLine4: '55',
      addressLine5: '123456'
    }
  }
} satisfies EventState

function getFieldParams(form: EventState = DEFAULT_FORM) {
  return {
    $form: form,
    $now: formatISO(new Date(), { representation: 'date' }),
    $locations: [
      {
        id: 'e15d54b0-8c74-45f0-aa35-e1b0501b38dc' as UUID
      },
      {
        id: 'e2e6dfcf-2603-458c-983f-abb1b31a617a' as UUID
      },
      {
        id: 'f1e14eed-3420-49df-9e2f-0b362e854cff' as UUID
      }
    ],
    $online: false
  } satisfies ConditionalParameters
}

describe('"universal" conditionals', () => {
  it('validates "and" conditional', () => {
    expect(
      validate(
        and(
          field('applicant.name').isEqualTo('John Doe'),
          field('applicant.dob').isAfter().date('1989-01-01')
        ),
        getFieldParams()
      )
    ).toBe(true)

    expect(
      validate(
        and(
          field('applicant.name').isEqualTo('John Doe'),
          field('applicant.dob').isAfter().date('1991-01-01')
        ),
        getFieldParams()
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
        getFieldParams()
      )
    ).toBe(true)

    expect(
      validate(
        or(
          field('applicant.name').isEqualTo('John Doe'),
          field('applicant.dob').isAfter().date('1991-01-01')
        ),
        getFieldParams()
      )
    ).toBe(true)

    expect(
      validate(
        or(
          field('applicant.name').isEqualTo('Jack Doe'),
          field('applicant.dob').isAfter().date('1991-01-01')
        ),
        getFieldParams()
      )
    ).toBe(false)
  })

  it('validates "not" conditional', () => {
    expect(
      validate(
        not(field('applicant.name').isEqualTo('John Doe')),
        getFieldParams()
      )
    ).toBe(false)

    expect(
      validate(
        not(field('applicant.name').isEqualTo('Jack Doe')),
        getFieldParams()
      )
    ).toBe(true)

    expect(
      validate(
        not(field('applicant.name').isEqualTo(field('informant.name'))),
        getFieldParams({
          'applicant.name': 'John Doe',
          'informant.name': 'John Doe'
        })
      )
    ).toBe(false)

    expect(
      validate(
        not(field('applicant.name').isEqualTo(field('informant.name'))),
        getFieldParams({
          'applicant.name': 'John Doe',
          'informant.name': 'Jane Doe'
        })
      )
    ).toBe(true)
  })
})

describe('object combinator', () => {
  it('can be used for validation composite inputs that produce objects', () => {
    expect(
      validate(
        field('child.name').object({
          firstname: field('firstname').isValidEnglishName(),
          surname: field('surname').isValidEnglishName()
        }),
        getFieldParams({
          'child.name': {
            firstname: 'John',
            surname: 'Doe'
          }
        })
      )
    ).toBe(true)

    expect(
      validate(
        field('child.name').object({
          firstname: field('firstname').isValidEnglishName(),
          surname: field('surname').isValidEnglishName()
        }),
        getFieldParams()
      )
    ).toBe(false)

    expect(
      validate(
        field('child.name').object({
          firstname: field('firstname').isValidEnglishName(),
          surname: field('surname').isValidEnglishName()
        }),
        getFieldParams({
          'child.name': {
            firstname: 'John'
          }
        })
      )
    ).toBe(false)
  })
  it('fully supports global variables like $now even in the nested levels', () => {
    expect(
      validate(
        field('child.details').object({
          dob: field('dob').isBefore().now()
        }),
        getFieldParams({
          'child.details': {
            dob: new Date('2125-01-01').toISOString().split('T')[0]
          }
        })
      )
    ).toBe(false)

    expect(
      validate(
        field('child.details').object({
          dob: field('dob').isBefore().now()
        }),
        getFieldParams({
          'child.details': {
            dob: new Date('2020-01-01').toISOString().split('T')[0]
          }
        })
      )
    ).toBe(true)

    expect(
      validate(
        field('child.details').object({
          nested: field('nested').isEqualTo(field('random'))
        }),
        getFieldParams({
          random: 'value',
          'child.details': {
            nested: 'value1'
          }
        })
      )
    ).toBe(false)

    expect(
      validate(
        field('child.details').object({
          nested: field('nested').isEqualTo(field('random'))
        }),
        getFieldParams({
          random: 'value',
          'child.details': {
            nested: 'value'
          }
        })
      )
    ).toBe(true)
  })
})

describe('date comparisons', () => {
  it("throws an error if validation context doesn't contain $now", () => {
    expect(() =>
      validate(field('applicant.dob').isAfter().days(30).inFuture(), {
        ...getFieldParams({
          'applicant.dob': '1990-06-12' // needs to be after 1990-02-01 ✅
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $now: undefined as any // $now is not defined ❌
      })
    ).toThrowError()
  })

  it('validates comparisons to where date is expected to be after certain date', () => {
    expect(
      validate(field('applicant.dob').isAfter().days(30).inFuture(), {
        ...getFieldParams({
          'applicant.dob': '1990-06-12' // needs to be after 1990-02-01 ✅
        }),
        $now: '1990-01-01'
      })
    ).toBe(true)

    expect(
      validate(field('applicant.dob').isAfter().days(30).inFuture(), {
        ...getFieldParams({
          'applicant.dob': '1990-01-12' // needs to be after 1990-02-01 ❌
        }),
        $now: '1990-01-01'
      })
    ).toBe(false)
  })
  it('validates comparisons to where date is expected to be before certain date', () => {
    expect(
      validate(field('applicant.dob').isBefore().days(30).inFuture(), {
        ...getFieldParams({
          'applicant.dob': '1990-02-12' // needs to be before 1990-07-06 ✅
        }),
        $now: '1990-06-06'
      })
    ).toBe(true)

    expect(
      validate(field('applicant.dob').isBefore().days(30).inFuture(), {
        ...getFieldParams({
          'applicant.dob': '1990-09-07' // needs to be before 1990-07-06 ❌
        }),
        $now: '1990-06-06'
      })
    ).toBe(false)
  })
})

describe('age asDob comparisons', () => {
  it('validates comparisons where dob from age field is expected to be before a certain time', () => {
    expect(
      validate(
        field('applicant.age')
          .asDob()
          .isBefore()
          .days(18 * 365)
          .inPast(),
        {
          ...getFieldParams({
            // dob is 1970-01-01
            'applicant.age': { age: 20, asOfDateRef: 'some.field' }
          }),
          $now: '1990-01-01'
        }
      )
    ).toBe(true)

    expect(
      validate(
        field('applicant.age')
          .asDob()
          .isBefore()
          .days(18 * 365)
          .inPast(),
        {
          ...getFieldParams({
            // dob is 1973-01-01
            'applicant.age': { age: 17, asOfDateRef: 'some.field' }
          }),
          $now: '1990-01-01'
        }
      )
    ).toBe(false)
  })

  it('validates comparisons where dob from age field is expected to be after a certain time', () => {
    expect(
      validate(
        field('applicant.age')
          .asDob()
          .isAfter()
          .days(18 * 365)
          .inPast(),
        {
          ...getFieldParams({
            // dob is 1973-01-01
            'applicant.age': { age: 17, asOfDateRef: 'some.field' }
          }),
          $now: '1990-01-01'
        }
      )
    ).toBe(true)

    expect(
      validate(
        field('applicant.age')
          .asDob()
          .isAfter()
          .days(18 * 365)
          .inPast(),
        {
          ...getFieldParams({
            // dob is 1971-01-01
            'applicant.age': { age: 19, asOfDateRef: 'some.field' }
          }),
          $now: '1990-01-01'
        }
      )
    ).toBe(false)
  })

  it('validates comparisons where dob from age field is expected to be after a certain date', () => {
    expect(
      validate(field('applicant.age').asDob().isAfter().date('1970-01-01'), {
        ...getFieldParams({
          // dob is 1973-01-01
          'applicant.age': { age: 17, asOfDateRef: 'some.field' }
        }),
        $now: '1990-01-01'
      })
    ).toBe(true)

    expect(
      validate(field('applicant.age').asDob().isAfter().date('1970-01-01'), {
        ...getFieldParams({
          // dob is 1963-01-01
          'applicant.age': { age: 27, asOfDateRef: 'some.field' }
        }),
        $now: '1990-01-01'
      })
    ).toBe(false)
  })

  it('validates comparisons where dob from age field is expected to be before a certain date', () => {
    expect(
      validate(field('applicant.age').asDob().isBefore().date('1980-01-01'), {
        ...getFieldParams({
          // dob is 1973-01-01
          'applicant.age': { age: 17, asOfDateRef: 'some.field' }
        }),
        $now: '1990-01-01'
      })
    ).toBe(true)

    expect(
      validate(field('applicant.age').asDob().isBefore().date('1970-01-01'), {
        ...getFieldParams({
          // dob is 1973-01-01
          'applicant.age': { age: 17, asOfDateRef: 'some.field' }
        }),
        $now: '1990-01-01'
      })
    ).toBe(false)
  })

  it('validates comparisons where dob from age field is expected to be before dob from another age field', () => {
    expect(
      validate(
        field('applicant.age')
          .asDob()
          .isBefore()
          .date(field('referrer.age').asDob()),
        {
          ...getFieldParams({
            // dob is 1973-01-01
            'applicant.age': {
              age: 17,
              asOfDateRef: 'reference.dob.one'
            },
            // dob is 1970-01-01
            'referrer.age': {
              age: 20,
              asOfDateRef: 'reference.dob.two'
            },
            'reference.dob.one': '1990-01-01',
            'reference.dob.two': '1995-01-01'
          }),
          $now: '1990-01-01'
        }
      )
    ).toBe(true)

    expect(
      validate(
        field('applicant.age')
          .asDob()
          .isBefore()
          .date(field('referrer.age').asDob()),
        {
          ...getFieldParams({
            // dob is 1973-01-01
            'applicant.age': {
              age: 17,
              asOfDateRef: 'reference.dob.one'
            },
            // dob is 1970-01-01
            'referrer.age': {
              age: 25,
              asOfDateRef: 'reference.dob.two'
            },
            'reference.dob.one': '1990-01-01',
            'reference.dob.two': '1995-01-01'
          }),
          $now: '1990-01-01'
        }
      )
    ).toBe(false)
  })
})

describe('age asAge comparisons', () => {
  it('validates comparisons where age is expected to be equal to a certain value', () => {
    expect(
      validate(
        field('applicant.age').asAge().isEqualTo(20),
        getFieldParams({
          'applicant.age': { age: 20, asOfDateRef: 'some.field' }
        })
      )
    ).toBe(true)

    expect(
      validate(
        field('applicant.age').asAge().isEqualTo(20),
        getFieldParams({
          'applicant.age': { age: 22, asOfDateRef: 'some.field' }
        })
      )
    ).toBe(false)
  })

  it('validates comparisons where age is expected to be equal to another age field', () => {
    expect(
      validate(
        field('applicant.age').asAge().isEqualTo(field('referrer.age').asAge()),
        getFieldParams({
          'applicant.age': { age: 20, asOfDateRef: 'some.field' },
          'referrer.age': { age: 20, asOfDateRef: 'some.field' }
        })
      )
    ).toBe(true)

    expect(
      validate(
        field('applicant.age').asAge().isEqualTo(field('referrer.age').asAge()),
        getFieldParams({
          'applicant.age': { age: 20, asOfDateRef: 'some.field' },
          'referrer.age': { age: 25, asOfDateRef: 'some.field' }
        })
      )
    ).toBe(false)
  })

  it('validates comparisons where age is expected to be less than a certain value', () => {
    expect(
      validate(
        field('applicant.age').asAge().isLessThan(25),
        getFieldParams({
          'applicant.age': { age: 20, asOfDateRef: 'some.field' }
        })
      )
    ).toBe(true)

    expect(
      validate(
        field('applicant.age').asAge().isLessThan(25),
        getFieldParams({
          'applicant.age': { age: 30, asOfDateRef: 'some.field' }
        })
      )
    ).toBe(false)
  })

  it('validates comparisons where age is expected to be less than another age field', () => {
    expect(
      validate(
        field('applicant.age')
          .asAge()
          .isLessThan(field('referrer.age').asAge()),
        getFieldParams({
          'applicant.age': { age: 20, asOfDateRef: 'some.field' },
          'referrer.age': { age: 22, asOfDateRef: 'some.field' }
        })
      )
    ).toBe(true)

    expect(
      validate(
        field('applicant.age')
          .asAge()
          .isLessThan(field('referrer.age').asAge()),
        getFieldParams({
          'applicant.age': { age: 20, asOfDateRef: 'some.field' },
          'referrer.age': { age: 18, asOfDateRef: 'some.field' }
        })
      )
    ).toBe(false)
  })

  it('validates comparisons where age is expected to be between a certain value range', () => {
    expect(
      validate(
        field('applicant.age').asAge().isBetween(16, 25),
        getFieldParams({
          'applicant.age': { age: 20, asOfDateRef: 'some.field' }
        })
      )
    ).toBe(true)

    expect(
      validate(
        field('applicant.age').asAge().isBetween(16, 25),
        getFieldParams({
          'applicant.age': { age: 30, asOfDateRef: 'some.field' }
        })
      )
    ).toBe(false)
  })
})

describe('leaf level validations', () => {
  it('validates leaf level fields', () => {
    expect(
      validate(
        field('applicant.address').isValidAdministrativeLeafLevel(),
        getFieldParams()
      )
    ).toBe(true)
  })
})

describe('"field" conditionals', () => {
  it('validates "field.isAfter" conditional', () => {
    expect(
      validate(
        field('applicant.dob').isAfter().date('1990-01-03'),
        getFieldParams()
      )
    ).toBe(false)

    // seems to be inclusive
    expect(
      validate(
        field('applicant.dob').isAfter().date('1990-01-02'),
        getFieldParams()
      )
    ).toBe(true)

    expect(
      validate(
        field('applicant.dob').isAfter().date('1990-01-01'),
        getFieldParams()
      )
    ).toBe(true)

    // Reference to another field, when the comparable field is after the reference field
    expect(
      validate(
        field('mother.dob').isAfter().date(field('child.dob')),
        getFieldParams({
          'child.dob': '1990-01-02',
          'mother.dob': '1990-02-03'
        })
      )
    ).toBe(true)

    // Reference to another field, when the comparable field is before the reference field
    expect(
      validate(
        field('mother.dob').isAfter().date(field('child.dob')),
        getFieldParams({
          'child.dob': '1990-01-02',
          'mother.dob': '1990-01-01'
        })
      )
    ).toBe(false)

    // Reference to another field, when the comparable field is undefined
    expect(
      validate(
        field('mother.dob').isAfter().date(field('child.dob')),
        getFieldParams({
          'child.dob': '1990-01-02'
        })
      )
    ).toBe(false)

    // Reference to another field, when the reference field is undefined
    expect(
      validate(
        field('mother.dob').isAfter().date(field('child.dob')),
        getFieldParams({
          'mother.dob': '1990-01-02'
        })
      )
    ).toBe(true)

    // Reference to another field, when the comparable field is wrong format
    expect(
      validate(
        field('mother.dob').isAfter().date(field('child.dob')),
        getFieldParams({
          'child.dob': '1990-01-02',
          'mother.dob': '1990-01-03123'
        })
      )
    ).toBe(false)

    // Reference to another field, when the reference field is wrong format
    expect(
      validate(
        field('mother.dob').isAfter().date(field('child.dob')),
        getFieldParams({
          'child.dob': '1990-01-021231',
          'mother.dob': '1990-01-03'
        })
      )
    ).toBe(false)
  })

  it('validates "field.isBefore" conditional', () => {
    expect(
      validate(
        field('applicant.dob').isBefore().date('1990-01-03'),
        getFieldParams()
      )
    ).toBe(true)

    // seems to be exclusive
    expect(
      validate(
        field('applicant.dob').isBefore().date('1990-01-02'),
        getFieldParams()
      )
    ).toBe(true)

    expect(
      validate(
        field('applicant.dob').isBefore().date('1990-01-01'),
        getFieldParams()
      )
    ).toBe(false)

    // Reference to another field, when the comparable field is before the reference field
    expect(
      validate(
        field('child.dob').isBefore().date(field('mother.dob')),
        getFieldParams({
          'mother.dob': '1990-01-02',
          'child.dob': '1990-01-01'
        })
      )
    ).toBe(true)

    // Reference to another field, when the comparable field is after the reference field
    expect(
      validate(
        field('child.dob').isBefore().date(field('mother.dob')),
        getFieldParams({
          'mother.dob': '1990-01-02',
          'child.dob': '1990-01-03'
        })
      )
    ).toBe(false)

    // Reference to another field, when the comparable field is undefined
    expect(
      validate(
        field('child.dob').isBefore().date(field('mother.dob')),
        getFieldParams({
          'mother.dob': '1990-01-02'
        })
      )
    ).toBe(false)

    // Reference to another field, when the reference field is undefined
    expect(
      validate(
        field('child.dob').isBefore().date(field('mother.dob')),
        getFieldParams({
          'child.dob': '1990-01-02'
        })
      )
    ).toBe(true)

    // Reference to another field, when the comparable field is wrong format
    expect(
      validate(
        field('child.dob').isBefore().date(field('mother.dob')),
        getFieldParams({
          'mother.dob': '1990-01-02',
          'child.dob': '1990-01-03123'
        })
      )
    ).toBe(false)

    // Reference to another field, when the reference field is wrong format
    expect(
      validate(
        field('child.dob').isBefore().date(field('mother.dob')),
        getFieldParams({
          'mother.dob': '1990-01-021231',
          'child.dob': '1990-01-03'
        })
      )
    ).toBe(false)
  })

  it('validates "field.isEqualTo" conditional', () => {
    expect(
      validate(field('applicant.name').isEqualTo('John Doe'), getFieldParams())
    ).toBe(true)

    expect(
      validate(field('applicant.name').isEqualTo('Jane Doe'), getFieldParams())
    ).toBe(false)

    expect(
      validate(
        field('applicant.field.not.exist').isEqualTo('Jane Doe'),
        getFieldParams()
      )
    ).toBe(false)

    expect(
      validate(
        field('applicant.name').isEqualTo(field('informant.name')),
        getFieldParams({
          'applicant.name': 'John Doe',
          'informant.name': 'John Doe'
        })
      )
    ).toBe(true)

    expect(
      validate(
        field('applicant.name').isEqualTo(field('informant.name')),
        getFieldParams({
          'applicant.name': 'John Doe',
          'informant.name': 'Jane Doe'
        })
      )
    ).toBe(false)

    expect(
      validate(
        field('applicant.name').isEqualTo(field('informant.name')),
        getFieldParams({
          'applicant.name': 'John Doe'
        })
      )
    ).toBe(false)

    expect(
      validate(
        field('applicant.name').isEqualTo(field('informant.name')),
        getFieldParams({
          'informant.name': 'Jane Doe'
        })
      )
    ).toBe(false)

    expect(
      validate(
        field('my.boolean').isEqualTo(field('other.boolean')),
        getFieldParams({
          'my.boolean': true,
          'other.boolean': true
        })
      )
    ).toBe(true)

    expect(
      validate(
        field('my.boolean').isEqualTo(field('other.boolean')),
        getFieldParams({
          'my.boolean': true,
          'other.boolean': false
        })
      )
    ).toBe(false)

    expect(
      validate(
        field('my.boolean').isEqualTo(field('other.boolean')),
        getFieldParams({
          'my.boolean': true
        })
      )
    ).toBe(false)

    expect(
      validate(
        field('my.boolean').isEqualTo(field('other.boolean')),
        getFieldParams({
          'other.boolean': false
        })
      )
    ).toBe(false)
  })

  it('validates "field.isUndefined" conditional', () => {
    expect(
      validate(field('applicant.name').isUndefined(), getFieldParams())
    ).toBe(false)
    expect(
      validate(
        field('applicant.field.not.exist').isUndefined(),
        getFieldParams()
      )
    ).toBe(true)
  })

  it('validates "field.inArray" conditional', () => {
    expect(
      validate(
        field('applicant.name').inArray(['Jack Doe', 'Jane Doe']),
        getFieldParams()
      )
    ).toBe(false)

    expect(
      validate(
        field('applicant.name').inArray(['John Doe', 'Jane Doe']),
        getFieldParams()
      )
    ).toBe(true)
  })

  it('validates "field.isFalsy" conditional', () => {
    const falsyFormParams = {
      $form: {
        'empty.string': '',
        'null.value': null,
        'undefined.value': undefined,
        'false.value': false,
        'deep.value': {
          foo: {
            bar: false,
            baz: null
          }
        }
      },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    } satisfies FormConditionalParameters

    expect(
      validate(field('some.id.not.defined.in.form').isFalsy(), falsyFormParams)
    ).toBe(true)
    expect(validate(field('empty.string').isFalsy(), falsyFormParams)).toBe(
      true
    )
    expect(validate(field('null.value').isFalsy(), falsyFormParams)).toBe(true)
    expect(validate(field('undefined.value').isFalsy(), falsyFormParams)).toBe(
      true
    )
    expect(validate(field('false.value').isFalsy(), falsyFormParams)).toBe(true)

    expect(
      validate(field('deep.value').get('foo.bar').isFalsy(), falsyFormParams)
    ).toBe(true)

    expect(
      validate(
        and(
          field('deep.value').get('foo.bar').isFalsy(),
          field('deep.value').get('foo.baz').isFalsy()
        ),
        falsyFormParams
      )
    ).toBe(true)
  })

  it('validates "field.isFalsy" conditional with null in parent when using `.get`', () => {
    const falsyFormParams = {
      $form: {
        'deep.nonvalue': null,
        'deep.value': {
          some: {
            value: null
          }
        }
      },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }

    expect(
      validate(field('deep.nonvalue').get('foo.bar').isFalsy(), falsyFormParams)
    ).toBe(true)

    expect(
      validate(field('deep.value').get('some.value').isFalsy(), falsyFormParams)
    ).toBe(true)

    expect(
      validate(field('deep.value').get('some').isFalsy(), falsyFormParams)
    ).toBe(false)

    expect(validate(field('deep.value').isFalsy(), falsyFormParams)).toBe(false)
  })
})

describe('"user" conditionals', () => {
  const userParams = {
    $user: {
      scope: ['record.register', 'record.registration-correct'],
      role: 'LOCAL_REGISTRAR',
      exp: '1739881718',
      algorithm: 'RS256',
      userType: TokenUserType.enum.user,
      sub: '677b33fea7efb08730f3abfa33'
    },
    $now: formatISO(new Date(), { representation: 'date' }),
    $online: true
  } satisfies UserConditionalParameters

  const offlineUserParams = {
    ...userParams,
    $online: false
  }

  it('validates "user.hasScope" conditional', () => {
    expect(validate(user.hasScope(SCOPES.VALIDATE), userParams)).toBe(false)

    expect(validate(user.hasScope(SCOPES.RECORD_REGISTER), userParams)).toBe(
      true
    )
  })

  it('validates "user.isOnline" conditional', () => {
    expect(validate(user.isOnline(), userParams)).toBe(true)
    expect(validate(user.isOnline(), offlineUserParams)).toBe(false)
  })

  it('validates "user.hasRole" conditional', () => {
    expect(validate(user.hasRole('LOCAL_REGISTRAR'), userParams)).toBe(true)
    expect(validate(user.hasRole('FAKE_ROLE'), offlineUserParams)).toBe(false)
  })
})

describe('"event" conditionals', () => {
  it('validates "event.hasAction" conditional', () => {
    const now = formatISO(new Date(), { representation: 'date' })
    const eventParams = {
      $now: now,
      $event: {
        id: '123' as UUID,
        type: 'birth',
        trackingId: 'TEST12',
        createdAt: now,
        updatedAt: now,
        actions: [
          {
            id: '1234' as UUID,
            type: ActionType.DECLARE,
            createdAt: now,
            createdBy: '12345',
            createdByUserType: TokenUserType.enum.user,
            createdByRole: 'some-role',
            declaration: {},
            createdAtLocation: '123456' as UUID,
            status: ActionStatus.Accepted,
            transactionId: '123456'
          }
        ]
      },
      $online: false
    } satisfies EventConditionalParameters

    expect(validate(event.hasAction(ActionType.DECLARE), eventParams)).toBe(
      true
    )

    expect(validate(event.hasAction(ActionType.REGISTER), eventParams)).toBe(
      false
    )
  })

  describe('hasAction given a PRINT_CERTIFICATE action', () => {
    const now = formatISO(new Date(), { representation: 'date' })
    const baseEvent = {
      $now: now,
      $event: {
        id: '123' as UUID,
        type: 'birth',
        trackingId: 'TEST12',
        createdAt: now,
        updatedAt: now,
        actions: [
          {
            id: 'a1' as UUID,
            type: ActionType.PRINT_CERTIFICATE,
            content: { templateId: 'TEMPLATE_1' },
            createdAt: now,
            status: ActionStatus.Accepted,
            transactionId: 'tx1',
            createdByUserType: TokenUserType.enum.user,
            createdBy: 'user1',
            createdByRole: 'role1',
            createdAtLocation: 'loc1' as UUID,
            declaration: {}
          },
          {
            id: 'a2' as UUID,
            type: ActionType.PRINT_CERTIFICATE,
            content: { templateId: 'TEMPLATE_2' },
            createdAt: now,
            status: ActionStatus.Accepted,
            transactionId: 'tx2',
            createdByUserType: TokenUserType.enum.user,
            createdBy: 'user2',
            createdByRole: 'role2',
            createdAtLocation: 'loc2' as UUID,
            declaration: {}
          }
        ]
      },
      $online: false
    } satisfies EventConditionalParameters

    it('returns true when minCount is met for a specific templateId', () => {
      expect(
        validate(
          event
            .hasAction(ActionType.PRINT_CERTIFICATE)
            .withTemplate('TEMPLATE_1')
            .minCount(1),
          baseEvent
        )
      ).toBe(true)
      expect(
        validate(
          event
            .hasAction(ActionType.PRINT_CERTIFICATE)
            .withTemplate('TEMPLATE_1')
            .minCount(2),
          baseEvent
        )
      ).toBe(false)
    })

    it('returns true when minCount is met for any print certificate action', () => {
      expect(
        validate(
          event.hasAction(ActionType.PRINT_CERTIFICATE).minCount(2),
          baseEvent
        )
      ).toBe(true)
      expect(
        validate(
          event.hasAction(ActionType.PRINT_CERTIFICATE).minCount(3),
          baseEvent
        )
      ).toBe(false)
    })

    it('returns true when maxCount is not exceeded for a specific templateId', () => {
      expect(
        validate(
          event
            .hasAction(ActionType.PRINT_CERTIFICATE)
            .withTemplate('TEMPLATE_1')
            .maxCount(1),
          baseEvent
        )
      ).toBe(true)
      expect(
        validate(
          event
            .hasAction(ActionType.PRINT_CERTIFICATE)
            .withTemplate('TEMPLATE_1')
            .maxCount(0),
          baseEvent
        )
      ).toBe(false)
    })

    it('returns true when maxCount is not exceeded for any print certificate action', () => {
      expect(
        validate(
          event.hasAction(ActionType.PRINT_CERTIFICATE).maxCount(2),
          baseEvent
        )
      ).toBe(true)
      expect(
        validate(
          event.hasAction(ActionType.PRINT_CERTIFICATE).maxCount(1),
          baseEvent
        )
      ).toBe(false)
    })
  })
})

describe('"valid name" conditionals', () => {
  describe('Valid names', () => {
    it('should pass for a single-word name', () => {
      const validName = 'John'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass for a two-word name', () => {
      const validName = 'John Doe'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass for a hyphenated name', () => {
      const validName = 'Anne-Marie'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass when name is enclosed in brackets', () => {
      const validName = '(John-Doe)'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass when brackets are around part of the name', () => {
      const validName = '(John) Doe'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass when brackets enclose the middle name', () => {
      const validName = 'John (Denver) Doe'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass when brackets enclose the last name', () => {
      const validName = 'John (Doe)'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should fail when name contains an underscore', () => {
      const invalidName = 'John_Doe'
      const params = {
        $form: { 'child.firstName': invalidName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(false)
    })

    it('should pass when name contains a number', () => {
      const validName = 'John 3rd'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass when name starts with a number', () => {
      const validName = "10th John The Alex'ander"
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass when name contains an apostrophe', () => {
      const validName = "John O'conor"
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })
  })

  describe('Invalid names', () => {
    it('should fail when brackets are empty', () => {
      const invalidName = '()'
      const params = {
        $form: { 'child.firstName': invalidName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(false)
    })

    it('should fail when brackets are wrongly placed at the end', () => {
      const invalidName = 'John Doe()'
      const params = {
        $form: { 'child.firstName': invalidName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(false)
    })

    it('should fail when brackets are not properly closed', () => {
      const invalidName = 'John (Doe'
      const params = {
        $form: { 'child.firstName': invalidName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(false)
    })

    it('should fail when brackets are improperly nested', () => {
      const invalidName = 'John (Doe))'
      const params = {
        $form: { 'child.firstName': invalidName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(false)
    })

    it('should fail when name contains a Bengali digit', () => {
      const invalidName = 'John১'
      const params = {
        $form: { 'child.firstName': invalidName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(false)
    })

    it('should fail when name contains non-Latin characters', () => {
      const invalidName = 'জন'
      const params = {
        $form: { 'child.firstName': invalidName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(false)
    })

    it('should fail when name contains commas', () => {
      const invalidName = ',,,'
      const params = {
        $form: { 'child.firstName': invalidName },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(false)
    })
  })
})

describe('"range number" conditional', () => {
  describe('Valid range', () => {
    it('should pass when the number is at the lower boundary', () => {
      const validRange = 0
      const params = {
        $form: { 'child.weightAtBirth': validRange },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.weightAtBirth').isBetween(0, 10), params)
      ).toBe(true)
    })

    it('should pass when the number is at the upper boundary', () => {
      const validRange = 10
      const params = {
        $form: { 'child.weightAtBirth': validRange },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.weightAtBirth').isBetween(0, 10), params)
      ).toBe(true)
    })

    it('should pass when the number is within the range', () => {
      const validRange = 5
      const params = {
        $form: { 'child.weightAtBirth': validRange },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.weightAtBirth').isBetween(0, 10), params)
      ).toBe(true)
    })
  })

  describe('Invalid range', () => {
    it('should fail when the number is below the lower boundary', () => {
      const invalidRange = -1
      const params = {
        $form: { 'child.weightAtBirth': invalidRange },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.weightAtBirth').isBetween(0, 10), params)
      ).toBe(false)
    })

    it('should fail when the number is above the upper boundary', () => {
      const invalidRange = 11
      const params = {
        $form: { 'child.weightAtBirth': invalidRange },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.weightAtBirth').isBetween(0, 10), params)
      ).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should pass for a decimal number within range', () => {
      const validRange = 5.5
      const params = {
        $form: { 'child.weightAtBirth': validRange },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.weightAtBirth').isBetween(0, 10), params)
      ).toBe(true)
    })

    it('should fail for a decimal number below the range', () => {
      const invalidRange = -0.1
      const params = {
        $form: { 'child.weightAtBirth': invalidRange },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.weightAtBirth').isBetween(0, 10), params)
      ).toBe(false)
    })

    it('should fail for a decimal number above the range', () => {
      const invalidRange = 10.1
      const params = {
        $form: { 'child.weightAtBirth': invalidRange },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('child.weightAtBirth').isBetween(0, 10), params)
      ).toBe(false)
    })
  })

  describe('Different field names', () => {
    it('should pass validation for an alternative field name', () => {
      const validRange = 7
      const params = {
        $form: { 'adult.heightInFeet': validRange },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('adult.heightInFeet').isBetween(5, 8), params)
      ).toBe(true)
    })

    it('should fail validation for an alternative field name', () => {
      const invalidRange = 4
      const params = {
        $form: { 'adult.heightInFeet': invalidRange },
        $now: formatISO(new Date(), { representation: 'date' }),
        $locations: [],
        $online: false
      }
      expect(
        validate(field('adult.heightInFeet').isBetween(5, 8), params)
      ).toBe(false)
    })
  })
})

describe('Matches conditional validation', () => {
  const PHONE_NUMBER_REGEX = '^0(7|9)[0-9]{8}$'
  it('should pass validation for existing phone number starting with 07', () => {
    const params = {
      $form: { 'applicant.phoneNo': '0733445566' },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(true)
  })

  it('should pass validation for different phone number starting with 09', () => {
    const params = {
      $form: { 'applicant.phoneNo': '0933445566' },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(true)
  })

  it('should fail validation for phone number starting with 05', () => {
    const params = {
      $form: { 'applicant.phoneNo': '0533445566' },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number shorter than 10 digits', () => {
    const params = {
      $form: { 'applicant.phoneNo': '07334455' }, // Only 8 digits
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number longer than 10 digits', () => {
    const params = {
      $form: { 'applicant.phoneNo': '073344556677' }, // 12 digits
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number without leading 0', () => {
    const params = {
      $form: { 'applicant.phoneNo': '733445566' }, // Missing leading 0
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for non-numeric input', () => {
    const params = {
      $form: { 'applicant.phoneNo': '07A3445566' }, // Contains a letter
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number not starting with 07 or 09', () => {
    const params = {
      $form: { 'applicant.phoneNo': '08334455667' }, // Invalid prefix
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number with incorrect length (too short)', () => {
    const params = {
      $form: { 'applicant.phoneNo': '073344556' }, // 9 digits only
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number with incorrect length (too long)', () => {
    const params = {
      $form: { 'applicant.phoneNo': '073344556677' }, // 12 digits
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number with spaces when strict regex is used', () => {
    const params = {
      $form: { 'applicant.phoneNo': '07 334455667' }, // Spaces not allowed
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number containing non-numeric characters', () => {
    const params = {
      $form: { 'applicant.phoneNo': '07A34455667' }, // Contains letter
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })
})

describe('Subfield nesting', () => {
  it('allows you to validate nested fields of more complex data', () => {
    const params = {
      $form: { 'applicant.http': { success: true } },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }
    expect(
      validate(field('applicant.http').get('success').isEqualTo(true), params)
    ).toBe(true)
  })
})

describe('isGreaterThan and isLessThan conditionals', () => {
  // --------- isGreaterThan with another field ----------
  it('should fail validation when numberOfChildren is not greater than numberOfDependents', () => {
    const params = {
      $form: {
        'family.numberOfChildren': 2,
        'family.numberOfDependents': 3
      },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }

    expect(
      validate(
        field('family.numberOfChildren').isGreaterThan({
          $$field: 'family.numberOfDependents',
          $$subfield: []
        }),
        params
      )
    ).toBe(false)
  })

  it('should pass validation when numberOfChildren is greater than numberOfDependents', () => {
    const params = {
      $form: {
        'family.numberOfChildren': 5,
        'family.numberOfDependents': 3
      },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }

    expect(
      validate(
        field('family.numberOfChildren').isGreaterThan({
          $$field: 'family.numberOfDependents',
          $$subfield: []
        }),
        params
      )
    ).toBe(true)
  })

  // --------- isGreaterThan with a number ----------
  it('should fail validation when salary is not greater than 10000', () => {
    const params = {
      $form: { 'employee.salary': 8000 },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }

    expect(
      validate(field('employee.salary').isGreaterThan(10000), params)
    ).toBe(false)
  })

  it('should pass validation when salary is greater than 10000', () => {
    const params = {
      $form: { 'employee.salary': 15000 },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }

    expect(
      validate(field('employee.salary').isGreaterThan(10000), params)
    ).toBe(true)
  })

  // --------- isLessThan with another field ----------
  it('should fail validation when yearsMarried is not less than yearsSinceGraduation', () => {
    const params = {
      $form: {
        'person.yearsMarried': 15,
        'person.yearsSinceGraduation': 10
      },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }

    expect(
      validate(
        field('person.yearsMarried').isLessThan({
          $$field: 'person.yearsSinceGraduation',
          $$subfield: []
        }),
        params
      )
    ).toBe(false)
  })

  it('should pass validation when yearsMarried is less than yearsSinceGraduation', () => {
    const params = {
      $form: {
        'person.yearsMarried': 5,
        'person.yearsSinceGraduation': 10
      },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }

    expect(
      validate(
        field('person.yearsMarried').isLessThan({
          $$field: 'person.yearsSinceGraduation',
          $$subfield: []
        }),
        params
      )
    ).toBe(true)
  })

  // --------- isLessThan with a number ----------
  it('should fail validation when vacationDays is not less than 30', () => {
    const params = {
      $form: { 'employee.vacationDays': 45 },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }

    expect(
      validate(field('employee.vacationDays').isLessThan(30), params)
    ).toBe(false)
  })

  it('should pass validation when vacationDays is less than 30', () => {
    const params = {
      $form: { 'employee.vacationDays': 15 },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }

    expect(
      validate(field('employee.vacationDays').isLessThan(30), params)
    ).toBe(true)
  })

  it('should fail validation when salary is equal to 10000', () => {
    const params = {
      $form: { 'employee.salary': 10000 },
      $now: formatISO(new Date(), { representation: 'date' }),
      $locations: [],
      $online: false
    }
    expect(
      validate(field('employee.salary').isGreaterThan(10000), params)
    ).toBe(false)
  })
})
