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
  AddressType,
  EventState,
  tennisClubMembershipEvent,
  ValidatorContext
} from '@opencrvs/commons/client'
import {
  getCleanedDeclarationDiff,
  isDeeplyEmpty,
  nullifyClearedNestedFields
} from './declarationDiff'

const eventConfiguration = tennisClubMembershipEvent
const validatorContext: ValidatorContext = {}

const filledName = { firstname: 'Jane', surname: 'Doe' }
const emptyName = { firstname: '', surname: '' }

describe('isDeeplyEmpty', () => {
  it.each([
    ['undefined', undefined, true],
    ['null', null, true],
    ['empty string', '', true],
    ['empty array', [], true],
    ['empty object', {}, true],
    ['array of empties', ['', null, undefined], true],
    ['nested empty object', { a: '', b: { c: null } }, true],
    ['NAME-shaped empty value', emptyName, true],
    ['non-empty string', 'Jane', false],
    ['number zero', 0, false],
    ['boolean false', false, false],
    ['array with value', [0], false],
    ['object with value', { a: 'x' }, false],
    ['NAME-shaped value', filledName, false]
  ] as const)('returns %s for %s', (_label, value, expected) => {
    expect(isDeeplyEmpty(value)).toBe(expected)
  })
})

describe('nullifyClearedNestedFields', () => {
  it('nulls nested address lines omitted from a partial correction payload', () => {
    const original = {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      administrativeArea: 'village-1',
      streetLevelDetails: { town: 'Springfield', residentialArea: 'North' }
    }
    const submitted = {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      administrativeArea: 'village-1',
      streetLevelDetails: {}
    }

    expect(nullifyClearedNestedFields(original, submitted)).toEqual({
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      administrativeArea: 'village-1',
      streetLevelDetails: null
    })
  })

  it('nulls only the nested address lines omitted from a partial payload', () => {
    const original = {
      streetLevelDetails: { town: 'Springfield', residentialArea: 'North' }
    }
    const submitted = {
      streetLevelDetails: { residentialArea: 'North' }
    }

    expect(nullifyClearedNestedFields(original, submitted)).toEqual({
      streetLevelDetails: { residentialArea: 'North', town: null }
    })
  })

  it('nulls a cleared NAME subfield omitted from the diff', () => {
    const original = { firstname: 'Jane', surname: 'Doe' }
    const submitted = { firstname: 'Janet' }

    expect(nullifyClearedNestedFields(original, submitted)).toEqual({
      firstname: 'Janet',
      surname: null
    })
  })
})

describe('getCleanedDeclarationDiff', () => {
  describe('empty inputs', () => {
    it('returns undefined when declarationDiff is undefined', () => {
      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration: { 'applicant.email': 'a@b.c' },
        declarationDiff: undefined,
        validatorContext
      })

      expect(result).toBeUndefined()
    })

    it('returns the empty object when declarationDiff is empty', () => {
      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration: { 'applicant.email': 'a@b.c' },
        declarationDiff: {},
        validatorContext
      })

      expect(result).toEqual({})
    })
  })

  describe('without an original declaration', () => {
    it('cleans hidden fields from the diff alone', () => {
      // recommender.none=true hides recommender.name and recommender.id.
      const declarationDiff: EventState = {
        'recommender.none': true,
        'recommender.name': filledName,
        'recommender.id': 'R-123'
      }

      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration: undefined,
        declarationDiff,
        validatorContext
      })

      expect(result).toEqual({ 'recommender.none': true })
    })

    it('returns the diff unchanged when no fields are hidden', () => {
      const declarationDiff: EventState = {
        'applicant.name': filledName,
        'applicant.email': 'jane@example.com'
      }

      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration: {},
        declarationDiff,
        validatorContext
      })

      expect(result).toEqual(declarationDiff)
    })
  })

  describe('with an original declaration', () => {
    it('drops fields that become hidden after applying the diff', () => {
      // Originally the user has a recommender filled in. The diff toggles
      // recommender.none=true, which hides the recommender fields. Even though
      // the diff still carries the (stale) recommender values, they must be
      // stripped because they are no longer valid in the cleaned declaration.
      const originalDeclaration: EventState = {
        'recommender.none': false,
        'recommender.name': filledName,
        'recommender.id': 'R-123'
      }
      const declarationDiff: EventState = {
        'recommender.none': true,
        'recommender.name': filledName,
        'recommender.id': 'R-123'
      }

      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration,
        declarationDiff,
        validatorContext
      })

      expect(result).toEqual({ 'recommender.none': true })
    })

    it('drops fields that become hidden when a sibling toggle changes', () => {
      // Toggling applicant.dobUnknown=true hides applicant.dob. A diff that
      // only carries the toggle must not be enriched with the (now hidden)
      // applicant.dob value.
      const originalDeclaration: EventState = {
        'applicant.dob': '1980-01-01',
        'applicant.dobUnknown': false
      }
      const declarationDiff: EventState = {
        'applicant.dob': '1980-01-01',
        'applicant.dobUnknown': true
      }

      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration,
        declarationDiff,
        validatorContext
      })

      expect(result).toEqual({ 'applicant.dobUnknown': true })
    })

    it('keeps unrelated diff fields untouched', () => {
      const originalDeclaration: EventState = {
        'applicant.name': filledName,
        'applicant.email': 'jane@example.com'
      }
      const declarationDiff: EventState = {
        'applicant.email': 'jane2@example.com'
      }

      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration,
        declarationDiff,
        validatorContext
      })

      expect(result).toEqual({ 'applicant.email': 'jane2@example.com' })
    })
  })

  describe('treatMissingAsCleared = false (default, partial payloads)', () => {
    it('emits null when a previously filled field is explicitly cleared in the diff', () => {
      const originalDeclaration: EventState = {
        'applicant.name': filledName,
        'applicant.email': 'jane@example.com'
      }
      const declarationDiff: EventState = {
        'applicant.email': ''
      }

      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration,
        declarationDiff,
        validatorContext
      })

      expect(result).toEqual({ 'applicant.email': null })
    })

    it('emits null for cleared nested NAME subfields in a partial diff', () => {
      const originalDeclaration: EventState = {
        'applicant.name': filledName
      }
      const declarationDiff: EventState = {
        'applicant.name': { firstname: 'Janet', surname: '' }
      }

      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration,
        declarationDiff,
        validatorContext
      })

      expect(result).toEqual({
        'applicant.name': { firstname: 'Janet', surname: null }
      })
    })

    it('does not emit null for keys missing from the diff', () => {
      // Correction-style partial payload: applicant.email is intentionally
      // omitted because the action does not touch it. It must NOT be
      // interpreted as a clear.
      const originalDeclaration: EventState = {
        'applicant.name': filledName,
        'applicant.email': 'jane@example.com'
      }
      const declarationDiff: EventState = {
        'applicant.name': { firstname: 'Janet', surname: 'Doe' }
      }

      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration,
        declarationDiff,
        validatorContext
      })

      expect(result).toEqual({
        'applicant.name': { firstname: 'Janet', surname: 'Doe' }
      })
      expect(result).not.toHaveProperty('applicant.email')
    })
  })

  describe('treatMissingAsCleared = true (full-form edits)', () => {
    it('emits null when a previously filled simple field is cleared with an empty string', () => {
      const originalDeclaration: EventState = {
        'applicant.name': filledName,
        'applicant.email': 'jane@example.com'
      }
      const declarationDiff: EventState = {
        'applicant.name': filledName,
        'applicant.email': ''
      }

      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration,
        declarationDiff,
        validatorContext,
        treatMissingAsCleared: true
      })

      expect(result).toMatchObject({
        'applicant.name': filledName,
        'applicant.email': null
      })
    })

    it('emits null when a previously filled key is missing from the diff', () => {
      const originalDeclaration: EventState = {
        'applicant.name': filledName,
        'applicant.email': 'jane@example.com'
      }
      const declarationDiff: EventState = {
        'applicant.name': { firstname: 'Janet', surname: 'Doe' }
      }

      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration,
        declarationDiff,
        validatorContext,
        treatMissingAsCleared: true
      })

      expect(result).toMatchObject({
        'applicant.name': { firstname: 'Janet', surname: 'Doe' },
        'applicant.email': null
      })
    })

    it('emits null when a previously filled complex (NAME) field is cleared with empty subfields', () => {
      const originalDeclaration: EventState = {
        'applicant.name': filledName
      }
      const declarationDiff: EventState = {
        'applicant.name': emptyName
      }

      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration,
        declarationDiff,
        validatorContext,
        treatMissingAsCleared: true
      })

      expect(result).toEqual({ 'applicant.name': null })
    })

    it('does not emit null when the original value was already empty', () => {
      // The user never filled applicant.email, so a missing/empty diff value
      // is not a "clear" and must not be sent as null.
      const originalDeclaration: EventState = {
        'applicant.name': filledName,
        'applicant.email': ''
      }
      const declarationDiff: EventState = {
        'applicant.name': { firstname: 'Janet', surname: 'Doe' }
      }

      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration,
        declarationDiff,
        validatorContext,
        treatMissingAsCleared: true
      })

      expect(result).not.toHaveProperty('applicant.email')
    })

    it('does not emit null for keys that become hidden in the cleaned declaration', () => {
      // recommender.name was originally filled. Toggling recommender.none=true
      // hides it; the field is dropped (not emitted as null) because it is no
      // longer part of the valid declaration shape.
      const originalDeclaration: EventState = {
        'recommender.none': false,
        'recommender.name': filledName,
        'recommender.id': 'R-123'
      }
      const declarationDiff: EventState = {
        'recommender.none': true
      }

      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration,
        declarationDiff,
        validatorContext,
        treatMissingAsCleared: true
      })

      expect(result).toEqual({ 'recommender.none': true })
      expect(result).not.toHaveProperty('recommender.name')
      expect(result).not.toHaveProperty('recommender.id')
    })

    it('treats false as a real value (does not clear a falsy checkbox)', () => {
      const originalDeclaration: EventState = {
        'recommender.none': true
      }
      const declarationDiff: EventState = {
        'recommender.none': false
      }

      const result = getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration,
        declarationDiff,
        validatorContext,
        treatMissingAsCleared: true
      })

      expect(result).toEqual({ 'recommender.none': false })
    })
  })
})
