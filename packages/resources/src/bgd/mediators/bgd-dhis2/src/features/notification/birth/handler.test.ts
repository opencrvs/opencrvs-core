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
import { birthNotificationHandler } from '@bgd-dhis2-mediator/features/notification/birth/handler'
import { body } from '@bgd-dhis2-mediator/test/birth-integration'
import * as fetchMock from 'jest-fetch-mock'

let fetch: fetchMock.FetchMock
let locationTuple: [fetchMock.BodyOrFunction, fetchMock.MockParams]

describe('Birth handler', () => {
  beforeAll(() => {
    fetch = fetchMock as fetchMock.FetchMock
    locationTuple = [
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              resourceType: 'Location',
              id: '123',
              partOf: { reference: 'Location/123' }
            }
          }
        ]
      }),
      {}
    ]
  })

  it('return a mediator response', async () => {
    const request = {
      payload: JSON.stringify(body),
      headers: { authorization: 'bearer xyz' }
    }
    const header = jest.fn()
    const code = jest.fn().mockReturnValue({ header })
    const h = { response: () => ({ code }) }

    // 3 x create patient location fetches
    fetch.mockResponses(...new Array(12).fill(locationTuple))

    // Resolve union
    fetch.mockResponses(...new Array(4).fill(locationTuple))

    // post bundle
    fetch.mockResponse(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            resource: {}
          }
        ]
      })
    )

    // @ts-ignore
    await birthNotificationHandler(request, h)

    expect(code).toBeCalledWith(201)
    expect(header).toBeCalledWith('Content-Type', 'application/json+openhim')

    fetch.resetMocks()
  })
})
