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
import { authApi } from '@client/utils/authApi'
import * as fetchMock from 'jest-fetch-mock'

jest.unmock('@client/utils/authApi')

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

describe('authApi', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  it('invalidates a token', async () => {
    const expectedResponse = {}
    fetch.mockResponseOnce(JSON.stringify(expectedResponse))

    const result = await authApi.invalidateToken('test')

    expect(result).toEqual(expectedResponse)
  })
})
