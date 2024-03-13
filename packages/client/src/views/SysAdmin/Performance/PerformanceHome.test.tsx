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
import { createStore } from '@client/store'
import { createRouterProps, createTestComponent } from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { PerformanceHome } from '@client/views/SysAdmin/Performance/PerformanceHome'
import { Event } from '@client/utils/gateway'
import { MockedProvider } from '@apollo/client/testing'
import {
  mockRegistrationCountRequest,
  mockPerformanceMetricsRequest,
  mockTotalCertificationsRequest,
  mockTotalPaymentsRequest,
  mockTotalCorrectionsRequest
} from './utils'

const graphqlMocks: MockedProvider['props']['mocks'] = [
  mockPerformanceMetricsRequest,
  mockRegistrationCountRequest,
  mockTotalCertificationsRequest,
  mockTotalPaymentsRequest,
  mockTotalCorrectionsRequest
]

describe('Performance home test', () => {
  describe('Performance home without location in props', () => {
    const { store, history } = createStore()
    let app: ReactWrapper

    beforeAll(async () => {
      const LOCATION_DHAKA_DIVISION = {
        displayLabel: 'Dhaka Division',
        id: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
        searchableText: 'Dhaka'
      }
      app = await createTestComponent(
        <PerformanceHome
          {...createRouterProps('/performance', undefined, {
            search: {
              locationId: LOCATION_DHAKA_DIVISION.id,
              event: Event.Birth,
              timeEnd: new Date(1487076708000).toISOString(),
              timeStart: new Date(1455454308000).toISOString()
            }
          })}
        />,
        {
          store,
          history,
          graphqlMocks
        }
      )
      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      app.update()
    })

    it('load performance home', () => {
      expect(app.find('#performanceHome').hostNodes()).toHaveLength(0)
    })
  })
})
