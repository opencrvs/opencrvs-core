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
  getUserRoleFromHistory,
  PractitionerRoleHistory,
  ResourceIdentifier
} from '@opencrvs/commons/types'

const history = [
  {
    resourceType: 'PractitionerRole',
    id: '1',
    meta: { versionId: '1', lastUpdated: '2020-01-01' },
    location: [{ reference: 'Location/1' as ResourceIdentifier }],
    code: [
      {
        coding: [
          {
            system: 'http://opencrvs.org/specs/roles',
            code: 'REGISTRATION_AGENT'
          }
        ]
      }
    ]
  },
  {
    resourceType: 'PractitionerRole',
    id: '2',
    location: [{ reference: 'Location/2' as ResourceIdentifier }],
    meta: { versionId: '2', lastUpdated: '2023-01-01' },
    code: [
      {
        coding: [
          {
            system: 'http://opencrvs.org/specs/roles',
            code: 'LOCAL_REGISTRAR'
          }
        ]
      }
    ]
  }
] satisfies PractitionerRoleHistory[]

describe('getUserRoleFromHistory', () => {
  it('should find the user role from history at the given point in time', () => {
    expect(getUserRoleFromHistory(history, '2022-01-15')).toEqual(
      'REGISTRATION_AGENT'
    )
    expect(getUserRoleFromHistory(history, '2023-01-15')).toEqual(
      'LOCAL_REGISTRAR'
    )
  })

  it('should find the first user role from history if there is no role entry present at the given point in time', () => {
    expect(getUserRoleFromHistory(history, '2019-01-15')).toEqual(
      'REGISTRATION_AGENT'
    )
  })
})
