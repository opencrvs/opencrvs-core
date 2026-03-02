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
  userReferenceFunctions as user,
  resolveJurisdictionReference
} from './userReferences'

describe('userReferenceFunctions', () => {
  describe('user.scope()', () => {
    it('should return a scope attribute reference', () => {
      const result = user.scope('record.create').attribute('placeOfEvent')

      expect(result).toEqual({
        $scope: 'record.create',
        $attribute: 'placeOfEvent'
      })
    })
  })

  describe('user.jurisdiction()', () => {
    it("user.jurisdiction('administrativeArea') should return a direct jurisdiction reference", () => {
      const result = user.jurisdiction('administrativeArea')
      expect(result).toEqual({ $jurisdiction: 'administrativeArea' })
    })

    it("user.jurisdiction(user.scope('record.create').attribute('placeOfEvent')) should return a scope attribute reference", () => {
      const result = user.jurisdiction(
        user.scope('record.create').attribute('placeOfEvent')
      )
      expect(result).toEqual({
        $jurisdiction: { $scope: 'record.create', $attribute: 'placeOfEvent' }
      })
    })
  })
})

describe('resolveJurisdictionReference()', () => {
  it('should return a jurisdiction filter', () => {
    const result = resolveJurisdictionReference(
      { $jurisdiction: 'administrativeArea' },
      [
        'type=record.create&event=birth,death,tennis-club-membership&placeOfEvent=administrativeArea'
      ]
    )
    expect(result).toEqual('administrativeArea')
  })
})
