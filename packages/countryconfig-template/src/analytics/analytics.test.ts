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
import { sortAdministrativeAreasByParentFirst } from './analytics'
import { AdministrativeArea } from '@opencrvs/toolkit/events'

function area(id: string, parentId: string | null): AdministrativeArea {
  return {
    id: id as AdministrativeArea['id'],
    name: id,
    parentId: parentId as AdministrativeArea['parentId'],
    validUntil: null
  }
}

describe('sortAdministrativeAreasByParentFirst', () => {
  it('returns an empty array unchanged', () => {
    expect(sortAdministrativeAreasByParentFirst([])).toEqual([])
  })

  it('returns a single root area unchanged', () => {
    const root = area('country', null)
    expect(sortAdministrativeAreasByParentFirst([root])).toEqual([root])
  })

  it('places parent before child when given in reverse order', () => {
    const child = area('district', 'state')
    const parent = area('state', null)
    const result = sortAdministrativeAreasByParentFirst([child, parent])
    expect(result.map((a) => a.id)).toEqual(['state', 'district'])
  })

  it('handles a 3-level chain given in reverse order', () => {
    const level3 = area('village', 'district')
    const level2 = area('district', 'state')
    const level1 = area('state', null)
    const result = sortAdministrativeAreasByParentFirst([
      level3,
      level2,
      level1
    ])
    expect(result.map((a) => a.id)).toEqual(['state', 'district', 'village'])
  })

  it('handles multiple independent trees', () => {
    const childA = area('districtA', 'stateA')
    const rootA = area('stateA', null)
    const childB = area('districtB', 'stateB')
    const rootB = area('stateB', null)
    const result = sortAdministrativeAreasByParentFirst([
      childA,
      childB,
      rootB,
      rootA
    ])
    const names = result.map((a) => a.name)
    expect(names.indexOf('stateA')).toBeLessThan(names.indexOf('districtA'))
    expect(names.indexOf('stateB')).toBeLessThan(names.indexOf('districtB'))
  })

  it('handles a parent that is not in the input (external parent reference)', () => {
    // parent is not in the array — child should still appear
    const child = area('district', 'unknown-parent')
    const result = sortAdministrativeAreasByParentFirst([child])
    expect(result.map((a) => a.id)).toEqual(['district'])
  })

  it('does not duplicate areas', () => {
    const child = area('district', 'state')
    const parent = area('state', null)
    const result = sortAdministrativeAreasByParentFirst([parent, child, parent])
    expect(result).toHaveLength(2)
    expect(result.map((a) => a.id)).toEqual(['state', 'district'])
  })
})
