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
  event
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

describe('Validate conditionals', () => {
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
        validate(
          not(field('applicant.name').isEqualTo('John Doe')),
          fieldParams
        )
      ).toBe(false)

      expect(
        validate(
          not(field('applicant.name').isEqualTo('Jack Doe')),
          fieldParams
        )
      ).toBe(true)
    })
  })

  describe('"field" conditionals', () => {
    it('validates "field.isAfter" conditional', () => {
      expect(
        validate(
          field('applicant.dob').isAfter().date('1990-01-03'),
          fieldParams
        )
      ).toBe(false)

      // seems to be inclusive
      expect(
        validate(
          field('applicant.dob').isAfter().date('1990-01-02'),
          fieldParams
        )
      ).toBe(true)

      expect(
        validate(
          field('applicant.dob').isAfter().date('1990-01-01'),
          fieldParams
        )
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
    })

    it('validates "field.isUndefined" conditional', () => {
      expect(validate(field('applicant.name').isUndefined(), fieldParams)).toBe(
        false
      )
      expect(
        validate(field('applicant.name.foo').isUndefined(), fieldParams)
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
          createdAt: now,
          updatedAt: now,
          actions: [
            {
              id: '1234',
              type: ActionType.DECLARE,
              createdAt: now,
              createdBy: '12345',
              data: {},
              createdAtLocation: '123456',
              draft: false
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
})
