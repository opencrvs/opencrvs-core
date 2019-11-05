/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { resolvers } from '@gateway/features/role/root-resolvers'
import * as fetch from 'jest-fetch-mock'

beforeEach(() => {
  fetch.resetMocks()
})

describe('Role root resolvers', () => {
  describe('getRoles()', () => {
    const dummyRoleList = [
      {
        title: 'Field Agent',
        value: 'FIELD_AGENT',
        types: ['Hospital', 'CHA'],
        active: true,
        creationDate: 1559054406433
      },
      {
        title: 'Registration Agent',
        value: 'REGISTRATION_AGENT',
        types: ['Entrepeneur', 'Data entry clerk'],
        active: true,
        creationDate: 1559054406444
      },
      {
        title: 'Registrar',
        value: 'LOCAL_REGISTRAR',
        types: ['Secretary', 'Chairman', 'Mayor'],
        active: true,
        creationDate: 1559054406455
      }
    ]
    it('returns full role list', async () => {
      fetch.mockResponseOnce(JSON.stringify(dummyRoleList))

      const response = await resolvers.Query.getRoles({}, {})

      expect(response).toEqual(dummyRoleList)
    })
    it('returns filtered role list', async () => {
      fetch.mockResponseOnce(JSON.stringify([dummyRoleList[2]]))

      const response = await resolvers.Query.getRoles(
        {},
        {
          sortBy: '_id',
          sortOrder: 'desc',
          title: 'Registrar',
          value: 'LOCAL_REGISTRAR',
          type: 'Mayor',
          active: true
        }
      )
      expect(response).toEqual([dummyRoleList[2]])
    })
  })
})
