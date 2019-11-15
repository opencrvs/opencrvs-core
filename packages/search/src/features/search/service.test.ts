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
import { searchComposition } from '@search/features/search/service'
import { client } from '@search/elasticsearch/client'

describe('elasticsearch db helper', () => {
  it('should index a composition with proper configuration', async () => {
    const searchSpy = jest.spyOn(client, 'search')
    const searchQuery = {
      query: 'some query',
      trackingId: 'dummy',
      contactNumber: 'dummy',
      registrationNumber: 'dummy',
      event: 'EMPTY_STRING',
      status: ['DECLARED'],
      type: ['birth-application', 'death-application'],
      applicationLocationId: 'EMPTY_STRING',
      from: 0,
      size: 10
    }
    searchComposition(searchQuery)
    expect(searchSpy).toBeCalled()
  })

  it('should index a composition with minimum configuration', async () => {
    const searchSpy = jest.spyOn(client, 'search')
    searchComposition({})
    expect(searchSpy).toBeCalled()
  })
})
