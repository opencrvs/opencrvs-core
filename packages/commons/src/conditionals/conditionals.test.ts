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
import { ActionType } from '../events'

const fieldParams = {
  $form: {
    'applicant.name': 'John Doe',
    'applicant.dob': '1990-01-02'
  },
  $now: formatISO(new Date(), { representation: 'date' })
} satisfies ConditionalParameters

describe('"universal" conditionals', () => {
  it('validates "and" conditional', () => {
    expect(
      validate(
        and(
          field('applicant.name').isEqualTo('John Doe'),
          field('applicant.dob').isAfter().date('1989-01-01')
        ),
        fieldParams
      )
    ).toBe(true)

    expect(
      validate(
        and(
          field('applicant.name').isEqualTo('John Doe'),
          field('applicant.dob').isAfter().date('1991-01-01')
        ),
        fieldParams
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
        fieldParams
      )
    ).toBe(true)

    expect(
      validate(
        or(
          field('applicant.name').isEqualTo('John Doe'),
          field('applicant.dob').isAfter().date('1991-01-01')
        ),
        fieldParams
      )
    ).toBe(true)

    expect(
      validate(
        or(
          field('applicant.name').isEqualTo('Jack Doe'),
          field('applicant.dob').isAfter().date('1991-01-01')
        ),
        fieldParams
      )
    ).toBe(false)
  })

  it('validates "not" conditional', () => {
    expect(
      validate(not(field('applicant.name').isEqualTo('John Doe')), fieldParams)
    ).toBe(false)

    expect(
      validate(not(field('applicant.name').isEqualTo('Jack Doe')), fieldParams)
    ).toBe(true)
  })
})

describe('"field" conditionals', () => {
  it('validates "field.isAfter" conditional', () => {
    expect(
      validate(field('applicant.dob').isAfter().date('1990-01-03'), fieldParams)
    ).toBe(false)

    // seems to be inclusive
    expect(
      validate(field('applicant.dob').isAfter().date('1990-01-02'), fieldParams)
    ).toBe(true)

    expect(
      validate(field('applicant.dob').isAfter().date('1990-01-01'), fieldParams)
    ).toBe(true)
  })

  it('validates "field.isBefore" conditional', () => {
    expect(
      validate(
        field('applicant.dob').isBefore().date('1990-01-03'),
        fieldParams
      )
    ).toBe(true)

    // seems to be exclusive
    expect(
      validate(
        field('applicant.dob').isBefore().date('1990-01-02'),
        fieldParams
      )
    ).toBe(true)

    expect(
      validate(
        field('applicant.dob').isBefore().date('1990-01-01'),
        fieldParams
      )
    ).toBe(false)
  })

  it('validates "field.isEqualTo" conditional', () => {
    expect(
      validate(field('applicant.name').isEqualTo('John Doe'), fieldParams)
    ).toBe(true)

    expect(
      validate(field('applicant.name').isEqualTo('Jane Doe'), fieldParams)
    ).toBe(false)

    expect(
      validate(
        field('applicant.field.not.exist').isEqualTo('Jane Doe'),
        fieldParams
      )
    ).toBe(false)
  })

  it('validates "field.isUndefined" conditional', () => {
    expect(validate(field('applicant.name').isUndefined(), fieldParams)).toBe(
      false
    )
    expect(
      validate(field('applicant.field.not.exist').isUndefined(), fieldParams)
    ).toBe(true)
  })

  it('validates "field.inArray" conditional', () => {
    expect(
      validate(
        field('applicant.name').inArray(['Jack Doe', 'Jane Doe']),
        fieldParams
      )
    ).toBe(false)

    expect(
      validate(
        field('applicant.name').inArray(['John Doe', 'Jane Doe']),
        fieldParams
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
        actions: [
          {
            id: '1234',
            type: ActionType.DECLARE,
            createdAt: now,
            createdBy: '12345',
            data: {},
            createdAtLocation: '123456'
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
