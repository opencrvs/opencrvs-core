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

import { describe, it, expect } from 'vitest'
import { generateUsername } from './utils'

describe('generateUsername', () => {
  it('combines initials and surname with dot separator', () => {
    expect(generateUsername({ firstname: 'John', surname: 'Doe' })).toBe(
      'j.doe'
    )
  })

  it('combines multiple firstnames initials with surname', () => {
    expect(generateUsername({ firstname: 'Jane Win', surname: 'Doe' })).toBe(
      'jw.doe'
    )
  })
})

describe('Pads name to minimum length', () => {
  it('pads with zeros when result is shorter than 5 characters', () => {
    expect(generateUsername({ firstname: 'J', surname: 'Do' })).toBe('j.do0')
  })

  it('does not pad when result 5 characters or more', () => {
    expect(generateUsername({ firstname: 'John', surname: 'Doe' })).toBe(
      'j.doe'
    )
    expect(generateUsername({ firstname: 'John', surname: 'Smith' })).toBe(
      'j.smith'
    )
  })
})

describe('diacritic stripping', () => {
  it('strips diacritics from firstname', () => {
    expect(generateUsername({ firstname: 'Änni', surname: 'Okay' })).toBe(
      'a.okay'
    )
  })

  it('strips diacritics from surname', () => {
    expect(generateUsername({ firstname: 'Okay', surname: 'Änni' })).toBe(
      'o.anni'
    )
  })
})

describe('special characters', () => {
  it('generates username based on surname when firstname is only special characters', () => {
    expect(generateUsername({ firstname: '----', surname: 'Doe' })).toBe(
      'doe00'
    )
  })

  it('preserves dots in surname', () => {
    expect(generateUsername({ firstname: 'St.', surname: 'James' })).toBe(
      's.james'
    )
  })

  it('preserves dashes in surname', () => {
    expect(
      generateUsername({ firstname: 'Anne', surname: 'Smith-Jones' })
    ).toBe('a.smith-jones')
  })

  it('strips apostrophes from surname', () => {
    expect(generateUsername({ firstname: 'Brian', surname: "O'Brien" })).toBe(
      'b.obrien'
    )
  })

  it('strips html-like names', () => {
    expect(
      generateUsername({
        firstname: '<h1>This is it<b>nam</b>',
        surname: '<h1>This is it<b>nam</b>'
      })
    ).toBe('ii.h1thisisitbnamb')
  })

  it('strips leading and trailing dashes from surname', () => {
    expect(generateUsername({ firstname: 'John', surname: '-Smith-' })).toBe(
      'j.smith'
    )
  })

  it('strips leading and trailing spaces', () => {
    expect(
      generateUsername({
        firstname: '  Jo   hn  ',
        surname: '   -S  mi  th-    '
      })
    ).toBe('jh.smith')
  })
})
