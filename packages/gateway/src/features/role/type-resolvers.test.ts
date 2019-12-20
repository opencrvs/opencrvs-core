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
import { roleTypeResolvers } from '@gateway/features/role/type-resolvers'
import * as fetch from 'jest-fetch-mock'

beforeEach(() => {
  fetch.resetMocks()
})

describe('Role type resolvers', () => {
  const mockResponse = {
    _id: 'ba7022f0ff4822',
    title: 'Field Agent',
    value: 'FIELD_AGENT',
    types: ['Hospital', 'CHA'],
    active: true,
    creationDate: 1559054406433
  }
  it('return id type', () => {
    const res = roleTypeResolvers.Role.id(mockResponse)
    expect(res).toEqual('ba7022f0ff4822')
  })
})
