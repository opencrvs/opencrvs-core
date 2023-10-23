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
import { roleTypeResolvers as rootResolvers } from '@gateway/features/role/type-resolvers'

import * as fetchMock from 'jest-fetch-mock'
const fetch = fetchMock as fetchMock.FetchMock

beforeEach(() => {
  fetch.resetMocks()
})
const roleTypeResolvers = rootResolvers as any
describe('Role type resolvers', () => {
  const mockResponse = {
    _id: 'ba7022f0ff4822',
    title: 'Field Agent',
    value: 'FIELD_AGENT',
    roles: [
      {
        labels: [
          {
            lang: 'en',
            label: 'Healthcare Worker'
          },
          {
            lang: 'fr',
            label: 'Professionnel de Santé'
          }
        ]
      },
      {
        labels: [
          {
            lang: 'en',
            label: 'Police Officer'
          },
          {
            lang: 'fr',
            label: 'Agent de Police'
          }
        ]
      },
      {
        labels: [
          {
            lang: 'en',
            label: 'Social Worker'
          },
          {
            lang: 'fr',
            label: 'Travailleur Social'
          }
        ]
      },
      {
        labels: [
          {
            lang: 'en',
            label: 'Local Leader'
          },
          {
            lang: 'fr',
            label: 'Leader Local'
          }
        ]
      }
    ],
    active: true,
    creationDate: 1559054406433
  }
  it('return id type', () => {
    const res = roleTypeResolvers.SystemRole.id(mockResponse)
    expect(res).toEqual('ba7022f0ff4822')
  })
})
