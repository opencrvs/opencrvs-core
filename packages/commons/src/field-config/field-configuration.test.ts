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

import { field } from '../events/field'

describe('field() helper', () => {
  const fieldId = 'some.field'

  it('should return correct config for range()', () => {
    const result = field(fieldId).range()
    expect(result).toEqual({
      fieldId: 'some.field',
      config: { type: 'RANGE' }
    })
  })

  it('should return correct config for exact()', () => {
    const result = field(fieldId).exact()
    expect(result).toEqual({
      fieldId: 'some.field',
      config: { type: 'EXACT' }
    })
  })

  it('should return correct config for fuzzy()', () => {
    const result = field(fieldId).fuzzy()
    expect(result).toEqual({
      fieldId: 'some.field',
      config: { type: 'FUZZY' }
    })
  })

  it('should handle different fieldIds correctly', () => {
    const result = field('user.age').range()
    expect(result).toEqual({
      fieldId: 'user.age',
      config: { type: 'RANGE' }
    })
  })
})
