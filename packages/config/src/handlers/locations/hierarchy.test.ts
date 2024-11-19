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
import { resolveLocationParents } from './locationTreeSolver'
import * as fixtures from '@opencrvs/commons/fixtures'
import { UUID } from '@opencrvs/commons'

describe('resolveLocationParents', () => {
  it('should return an empty array if the location has no parent', () => {
    const location = fixtures.savedLocation({
      id: 'uuid1' as UUID,
      partOf: undefined
    })

    const result = resolveLocationParents(location, [location])
    expect(result).toEqual([])
  })

  it('should resolve a single level parent correctly', () => {
    const parent = fixtures.savedLocation({
      id: 'uuid1' as UUID,
      partOf: undefined
    })
    const child = fixtures.savedLocation({
      id: 'uuid2' as UUID,
      partOf: { reference: 'Location/uuid1' as `Location/${UUID}` }
    })

    const result = resolveLocationParents(child, [child, parent])
    expect(result).toEqual([parent])
  })

  it('should resolve multiple levels of parents correctly', () => {
    const grandparent = fixtures.savedLocation({
      id: 'uuid1' as UUID,
      partOf: undefined
    })
    const parent = fixtures.savedLocation({
      id: 'uuid2' as UUID,
      partOf: { reference: 'Location/uuid1' as `Location/${UUID}` }
    })
    const child = fixtures.savedLocation({
      id: 'uuid3' as UUID,
      partOf: { reference: 'Location/uuid2' as `Location/${UUID}` }
    })
    const locations = [child, parent, grandparent]

    const result = resolveLocationParents(child, locations)
    expect(result).toEqual([grandparent, parent])
  })
})
