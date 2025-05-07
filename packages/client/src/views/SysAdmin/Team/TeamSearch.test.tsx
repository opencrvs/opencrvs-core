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
import { TEAM_USER_LIST } from '@client/navigation/routes'
import { queries } from '@client/profile/queries'
import { AppStore } from '@client/store'
import {
  createTestComponent,
  createTestStore,
  flushPromises,
  mockUserResponse,
  SYSTEM_ADMIN_DEFAULT_SCOPES,
  setScopes,
  fetchUserMock
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { ReactWrapper } from 'enzyme'
import { merge } from 'lodash'
import { parse } from 'query-string'
import * as React from 'react'
import { TeamSearch } from './TeamSearch'
import { vi } from 'vitest'
import { SCOPES } from '@opencrvs/commons/client'
import { createMemoryRouter } from 'react-router-dom'
import * as actions from '@client/profile/profileActions'
import { NetworkStatus } from '@apollo/client'

describe('Team search test', () => {
  let store: AppStore
  let router: ReturnType<typeof createMemoryRouter>

  beforeAll(async () => {
    const { store: testStore } = await createTestStore()
    store = testStore
  })

  describe('Team search without location in props', () => {
    let app: ReactWrapper

    beforeAll(async () => {
      setScopes(SYSTEM_ADMIN_DEFAULT_SCOPES, store)
      ;({ component: app, router } = await createTestComponent(<TeamSearch />, {
        store,
        initialEntries: [{ pathname: '', state: {} }]
      }))

      store.dispatch(
        actions.setUserDetails({
          loading: false,
          data: fetchUserMock('da672661-eb0a-437b-aa7a-a6d9a1711dd1'),
          networkStatus: NetworkStatus.ready
        })
      )
      app.update()
    })

    it('loads nothing in the search input box', () => {
      expect(
        app.find('#locationSearchInput').hostNodes().props().value
      ).toEqual('')
    })

    it('loads the selected location in search input box', () => {
      const locationInput = app.find(`input#locationSearchInput`).hostNodes()

      locationInput.simulate('change', {
        target: { id: `input#locationSearchInput`, value: 'moktarpur' }
      })
      locationInput.simulate('focus')

      app.update()

      app
        .find('#locationOption0d8474da-0361-4d32-979e-af91f012340a')
        .hostNodes()
        .simulate('click')
      app.update()

      expect(
        app.find('#locationSearchInput').hostNodes().props().value
      ).toEqual('Moktarpur Union Parishad')
    })

    it('redirect to user list on search button click', () => {
      Date.now = vi.fn(() => 1455454308000)
      app.find('#location-search-btn').hostNodes().simulate('click')
      app.update()
      flushPromises()

      expect(parse(router.state.location.search)).toEqual({
        locationId: '0d8474da-0361-4d32-979e-af91f012340a'
      })
      expect(router.state.location.pathname).toContain('/team/users')
    })
  })

  describe('Team search with location in props', () => {
    let testComponent: ReactWrapper<{}, {}>

    const mockFetchUserDetails = vi.fn()
    const nameObj = {
      data: {
        getUser: {
          name: [
            {
              use: 'en',
              firstNames: 'Mohammad',
              familyName: 'Ashraful',
              __typename: 'HumanName'
            },
            {
              use: 'bn',
              firstNames: '',
              familyName: '',
              __typename: 'HumanName'
            }
          ],
          role: {
            _id: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
            labels: [
              {
                lang: 'en',
                label: 'DISTRICT_REGISTRAR'
              }
            ]
          }
        }
      }
    }

    beforeAll(async () => {
      merge(mockUserResponse, nameObj)
      mockFetchUserDetails.mockReturnValue(mockUserResponse)
      queries.fetchUserDetails = mockFetchUserDetails
    })

    beforeAll(async () => {})

    beforeEach(async () => {
      setScopes([SCOPES.USER_READ], store)

      testComponent = (
        await createTestComponent(<TeamSearch />, {
          store,
          initialEntries: [
            {
              pathname: TEAM_USER_LIST,
              state: {
                selectedLocation: {
                  id: '',
                  searchableText: '',
                  displayLabel: 'Alokbali Union Parishad'
                }
              }
            }
          ]
        })
      )?.component
    })

    it('loads the location in the search input box', async () => {
      await waitForElement(testComponent, '#locationSearchInput')
      expect(
        testComponent.find('#locationSearchInput').hostNodes().props().value
      ).toEqual('Alokbali Union Parishad')
    })
  })
})
