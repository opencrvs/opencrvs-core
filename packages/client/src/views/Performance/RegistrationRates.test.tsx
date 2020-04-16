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

import * as React from 'react'
import { ReactWrapper } from 'enzyme'
import { createTestComponent, createTestStore } from '@client/tests/util'
import { AppStore } from '@client/store'
import { RegistrationRates } from '@client/views/Performance/RegistrationRates'
import { EVENT_REGISTRATION_RATES } from '@client/navigation/routes'
import { GET_CHILD_LOCATIONS_BY_PARENT_ID } from '@client/views/Performance/queries'
import { waitForElement } from '@client/tests/wait-for-element'

const LOCATION_DHAKA_DIVISION = {
  displayLabel: 'Dhaka Division',
  id: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
  searchableText: 'Dhaka'
}

const graphqlMocks = [
  {
    request: {
      query: GET_CHILD_LOCATIONS_BY_PARENT_ID,
      variables: { parentId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b' }
    },
    result: {
      data: {
        locationsByParent: [
          {
            id: 'd70fbec1-2b26-474b-adbc-bb83783bdf29',
            type: 'ADMIN_STRUCTURE',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/geo-id',
                value: '4194'
              },
              {
                system: 'http://opencrvs.org/specs/id/bbs-code',
                value: '11'
              },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'UNION'
              },
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-reference',
                value: 'division=9&district=30&upazila=233&union=4194'
              }
            ]
          },
          {
            id: '78e264aa-e493-430e-9314-594641c5703f',
            type: 'ADMIN_STRUCTURE',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/geo-id',
                value: '4195'
              },
              {
                system: 'http://opencrvs.org/specs/id/bbs-code',
                value: '23'
              },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'UNION'
              },
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-reference',
                value: 'division=9&district=30&upazila=233&union=4195'
              }
            ]
          }
        ]
      }
    }
  }
]
describe('Registraion Rates tests', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore

  beforeAll(async () => {
    store = (await createTestStore()).store
  })

  beforeEach(async () => {
    component = (await createTestComponent(
      <RegistrationRates
        match={{
          params: { eventType: 'birth' },
          isExact: true,
          path: EVENT_REGISTRATION_RATES,
          url: ''
        }}
        // @ts-ignore
        history={{
          location: {
            state: {
              title: 'Birth registration rate within 45 days of event',
              selectedLocation: LOCATION_DHAKA_DIVISION
            },
            pathname: EVENT_REGISTRATION_RATES,
            search: '',
            hash: ''
          }
        }}
      />,
      store,
      graphqlMocks
    )).component

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    component.update()
  })

  it('renders the component', async () => {
    const header = await waitForElement(component, '#reg-rates-header')
  })

  it('because of more than one child locations from the query, by location option arrives in dropdown', async () => {
    const select = await waitForElement(component, '#base-select')
    select
      .hostNodes()
      .find('.react-select__control')
      .simulate('keyDown', { key: 'ArrowDown', keyCode: 40 })
    component.update()
    expect(component.find('.react-select__menu-list').children().length).toBe(2)
    expect(
      component
        .find('.react-select__menu-list')
        .childAt(1)
        .text()
    ).toBe('By location')
  })
})
