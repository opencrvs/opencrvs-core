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
import {
  mockUnion,
  mockUnionFacility
} from '@bgd-dhis2-mediator/test/locations'
import * as fetchMock from 'jest-fetch-mock'

let fetch: fetchMock.FetchMock
// When DHIS2 supports BBS codes, these tests will become valid
// let locationTuple: [fetchMock.BodyOrFunction, fetchMock.MockParams]

describe('Birth handler', () => {
  beforeAll(() => {
    fetch = fetchMock as fetchMock.FetchMock
    /*locationTuple = [
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
    ]*/
  })

  it('return a mediator response', async () => {
    const request = {
      payload: body,
      headers: { authorization: 'bearer xyz' }
    }
    const header = jest.fn()
    const code = jest.fn().mockReturnValue({ header })
    const h = { response: () => ({ code }) }

    fetch.mockResponses(
      [JSON.stringify(mockUnionFacility), { status: 200 }],
      [JSON.stringify(mockUnion), { status: 200 }],
      [
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              resource: {}
            }
          ]
        }),
        { status: 201 }
      ],
      [
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: {
                location: '/Composition/_id/1'
              }
            }
          ]
        }),
        { status: 201 }
      ]
    )
    // 3 x create patient location fetches
    // fetch.mockResponses(...new Array(12).fill(locationTuple))

    // Resolve union
    // fetch.mockResponses(...new Array(4).fill(locationTuple))

    // @ts-ignore
    await birthNotificationHandler(request, h)
    expect(code).toBeCalledWith(201)
    expect(header).toBeCalledWith('Content-Type', 'application/json+openhim')

    fetch.resetMocks()
  })
})
