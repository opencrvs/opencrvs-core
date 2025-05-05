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
  field,
  not,
  ConditionalParameters,
  UserConditionalParameters,
  EventConditionalParameters,
  event,
  FormConditionalParameters
} from './conditionals'
import { formatISO } from 'date-fns'
import { SCOPES } from '../scopes'
import { ActionType } from '../events/ActionType'
import { ActionStatus } from '../events/ActionDocument'

/*  eslint-disable max-lines */

const DEFAULT_FORM = {
  'applicant.name': 'John Doe',
  'applicant.dob': '1990-01-02'
}

function getFieldParams(form: Record<string, unknown> = DEFAULT_FORM) {
  return {
    $form: form,
    $now: formatISO(new Date(), { representation: 'date' })
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
        'false.value': false
      },
      $now: formatISO(new Date(), { representation: 'date' })
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
  })
})

describe('"user" conditionals', () => {
  const userParams = {
    $user: {
      scope: ['record.register', 'record.registration-correct'],
      exp: '1739881718',
      algorithm: 'RS256',
      sub: '677b33fea7efb08730f3abfa33'
    },
    $now: formatISO(new Date(), { representation: 'date' })
  } satisfies UserConditionalParameters

  it('validates "user.hasScope" conditional', () => {
    expect(validate(user.hasScope(SCOPES.VALIDATE), userParams)).toBe(false)

    expect(validate(user.hasScope(SCOPES.RECORD_REGISTER), userParams)).toBe(
      true
    )
  })
})

describe('"event" conditionals', () => {
  it('validates "event.hasAction" conditional', () => {
    const now = formatISO(new Date(), { representation: 'date' })
    const eventParams = {
      $now: now,
      $event: {
        id: '123',
        type: 'birth',
        trackingId: 'TEST12',
        createdAt: now,
        updatedAt: now,
        dateOfEventField: 'child.dateOfBirth',
        updatedAtLocation: '123456',
        actions: [
          {
            id: '1234',
            type: ActionType.DECLARE,
            createdAt: now,
            createdBy: '12345',
            createdByRole: 'some-role',
            declaration: {},
            createdAtLocation: '123456',
            status: ActionStatus.Accepted,
            transactionId: '123456'
          }
        ]
      }
    } satisfies EventConditionalParameters

    expect(validate(event.hasAction(ActionType.DECLARE), eventParams)).toBe(
      true
    )

    expect(validate(event.hasAction(ActionType.REGISTER), eventParams)).toBe(
      false
    )
  })
})

describe('"valid name" conditionals', () => {
  describe('Valid names', () => {
    it('should pass for a single-word name', () => {
      const validName = 'John'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass for a two-word name', () => {
      const validName = 'John Doe'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass for a hyphenated name', () => {
      const validName = 'Anne-Marie'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass when name is enclosed in brackets', () => {
      const validName = '(John-Doe)'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass when brackets are around part of the name', () => {
      const validName = '(John) Doe'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass when brackets enclose the middle name', () => {
      const validName = 'John (Denver) Doe'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass when brackets enclose the last name', () => {
      const validName = 'John (Doe)'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass when name contains an underscore', () => {
      const validName = 'John_Doe'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass when name contains a number', () => {
      const validName = 'John 3rd'
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass when name starts with a number', () => {
      const validName = "10th John The Alex'ander"
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(true)
    })

    it('should pass when name contains an apostrophe', () => {
      const validName = "John O'conor"
      const params = {
        $form: { 'child.firstName': validName },
        $now: formatISO(new Date(), { representation: 'date' })
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
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(false)
    })

    it('should fail when brackets are wrongly placed at the end', () => {
      const invalidName = 'John Doe()'
      const params = {
        $form: { 'child.firstName': invalidName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(false)
    })

    it('should fail when brackets are not properly closed', () => {
      const invalidName = 'John (Doe'
      const params = {
        $form: { 'child.firstName': invalidName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(false)
    })

    it('should fail when brackets are improperly nested', () => {
      const invalidName = 'John (Doe))'
      const params = {
        $form: { 'child.firstName': invalidName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(false)
    })

    it('should fail when name contains a Bengali digit', () => {
      const invalidName = 'John১'
      const params = {
        $form: { 'child.firstName': invalidName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(false)
    })

    it('should fail when name contains non-Latin characters', () => {
      const invalidName = 'জন'
      const params = {
        $form: { 'child.firstName': invalidName },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.firstName').isValidEnglishName(), params)
      ).toBe(false)
    })

    it('should fail when name contains commas', () => {
      const invalidName = ',,,'
      const params = {
        $form: { 'child.firstName': invalidName },
        $now: formatISO(new Date(), { representation: 'date' })
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
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.weightAtBirth').isBetween(0, 10), params)
      ).toBe(true)
    })

    it('should pass when the number is at the upper boundary', () => {
      const validRange = 10
      const params = {
        $form: { 'child.weightAtBirth': validRange },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.weightAtBirth').isBetween(0, 10), params)
      ).toBe(true)
    })

    it('should pass when the number is within the range', () => {
      const validRange = 5
      const params = {
        $form: { 'child.weightAtBirth': validRange },
        $now: formatISO(new Date(), { representation: 'date' })
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
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.weightAtBirth').isBetween(0, 10), params)
      ).toBe(false)
    })

    it('should fail when the number is above the upper boundary', () => {
      const invalidRange = 11
      const params = {
        $form: { 'child.weightAtBirth': invalidRange },
        $now: formatISO(new Date(), { representation: 'date' })
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
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.weightAtBirth').isBetween(0, 10), params)
      ).toBe(true)
    })

    it('should fail for a decimal number below the range', () => {
      const invalidRange = -0.1
      const params = {
        $form: { 'child.weightAtBirth': invalidRange },
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('child.weightAtBirth').isBetween(0, 10), params)
      ).toBe(false)
    })

    it('should fail for a decimal number above the range', () => {
      const invalidRange = 10.1
      const params = {
        $form: { 'child.weightAtBirth': invalidRange },
        $now: formatISO(new Date(), { representation: 'date' })
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
        $now: formatISO(new Date(), { representation: 'date' })
      }
      expect(
        validate(field('adult.heightInFeet').isBetween(5, 8), params)
      ).toBe(true)
    })

    it('should fail validation for an alternative field name', () => {
      const invalidRange = 4
      const params = {
        $form: { 'adult.heightInFeet': invalidRange },
        $now: formatISO(new Date(), { representation: 'date' })
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
      $now: formatISO(new Date(), { representation: 'date' })
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(true)
  })

  it('should pass validation for different phone number starting with 09', () => {
    const params = {
      $form: { 'applicant.phoneNo': '0933445566' },
      $now: formatISO(new Date(), { representation: 'date' })
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(true)
  })

  it('should fail validation for phone number starting with 05', () => {
    const params = {
      $form: { 'applicant.phoneNo': '0533445566' },
      $now: formatISO(new Date(), { representation: 'date' })
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number shorter than 10 digits', () => {
    const params = {
      $form: { 'applicant.phoneNo': '07334455' }, // Only 8 digits
      $now: formatISO(new Date(), { representation: 'date' })
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number longer than 10 digits', () => {
    const params = {
      $form: { 'applicant.phoneNo': '073344556677' }, // 12 digits
      $now: formatISO(new Date(), { representation: 'date' })
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number without leading 0', () => {
    const params = {
      $form: { 'applicant.phoneNo': '733445566' }, // Missing leading 0
      $now: formatISO(new Date(), { representation: 'date' })
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for non-numeric input', () => {
    const params = {
      $form: { 'applicant.phoneNo': '07A3445566' }, // Contains a letter
      $now: formatISO(new Date(), { representation: 'date' })
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number not starting with 07 or 09', () => {
    const params = {
      $form: { 'applicant.phoneNo': '08334455667' }, // Invalid prefix
      $now: formatISO(new Date(), { representation: 'date' })
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number with incorrect length (too short)', () => {
    const params = {
      $form: { 'applicant.phoneNo': '073344556' }, // 9 digits only
      $now: formatISO(new Date(), { representation: 'date' })
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number with incorrect length (too long)', () => {
    const params = {
      $form: { 'applicant.phoneNo': '073344556677' }, // 12 digits
      $now: formatISO(new Date(), { representation: 'date' })
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number with spaces when strict regex is used', () => {
    const params = {
      $form: { 'applicant.phoneNo': '07 334455667' }, // Spaces not allowed
      $now: formatISO(new Date(), { representation: 'date' })
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })

  it('should fail validation for phone number containing non-numeric characters', () => {
    const params = {
      $form: { 'applicant.phoneNo': '07A34455667' }, // Contains letter
      $now: formatISO(new Date(), { representation: 'date' })
    }
    expect(
      validate(field('applicant.phoneNo').matches(PHONE_NUMBER_REGEX), params)
    ).toBe(false)
  })
})
