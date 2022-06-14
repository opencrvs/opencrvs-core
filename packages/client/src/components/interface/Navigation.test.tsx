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
import { checkAuth } from '@client/profile/profileActions'
import { queries } from '@client/profile/queries'
import { storage } from '@client/storage'
import { createStore } from '@client/store'
import {
  createTestComponent,
  mockUserResponse,
  flushPromises,
  natlSysAdminToken,
  registerScopeToken
} from '@client/tests/util'
import { createClient } from '@client/utils/apolloClient'
import { OfficeHome } from '@client/views/OfficeHome/OfficeHome'
import { merge } from 'lodash'
import * as React from 'react'
import {
  WORKQUEUE_TABS,
  Navigation
} from '@client/components/interface/Navigation'
import { ReactWrapper } from 'enzyme'

const getItem = window.localStorage.getItem as jest.Mock
const mockFetchUserDetails = jest.fn()

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
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      role: 'REGISTRATION_AGENT'
    }
  }
}

const nameObjNatlSysAdmin = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Mohammad',
          familyName: 'Ashraful',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      role: 'NATIONAL_SYSTEM_ADMIN'
    }
  }
}

storage.getItem = jest.fn()
storage.setItem = jest.fn()

let { store, history } = createStore()
let client = createClient(store)

describe('Navigation for national system admin related tests', () => {
  let testComponent: ReactWrapper<{}, {}>

  beforeEach(async () => {
    merge(mockUserResponse, nameObjNatlSysAdmin)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
    ;({ store, history } = createStore())
    client = createClient(store)
    getItem.mockReturnValue(natlSysAdminToken)
    await store.dispatch(checkAuth())

    testComponent = await createTestComponent(
      <OfficeHome
        match={{
          params: {
            tabId: WORKQUEUE_TABS.inProgress
          },
          isExact: true,
          path: '',
          url: ''
        }}
        staticContext={undefined}
        history={history}
        location={history.location}
      />,
      { store, history }
    )
  })

  it('Tabs loaded successfully including config tab', async () => {
    expect(testComponent.exists('#navigation_team')).toBeTruthy()
    expect(testComponent.exists('#navigation_performance')).toBeTruthy()
    expect(testComponent.exists('#navigation_config_main')).toBeTruthy()
    testComponent.find('#navigation_config_main').hostNodes().simulate('click')
    testComponent.update()
    expect(testComponent.exists('#navigation_application')).toBeTruthy()
    expect(testComponent.exists('#navigation_certificate')).toBeTruthy()
  })

  it('No application related tabs', async () => {
    expect(testComponent.exists('#navigation_progress')).toBeFalsy()
    expect(testComponent.exists('#navigation_sentForReview')).toBeFalsy()
    expect(testComponent.exists('#navigation_readyForReview')).toBeFalsy()
    expect(testComponent.exists('#navigation_requiresUpdate')).toBeFalsy()
    expect(testComponent.exists('#navigation_print')).toBeFalsy()
    expect(testComponent.exists('#navigation_waitingValidation')).toBeFalsy()
  })
})

describe('Navigation for Registration agent related tests', () => {
  let testComponent: ReactWrapper<{}, {}>

  beforeEach(async () => {
    merge(mockUserResponse, nameObj)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
    ;({ store, history } = createStore())
    client = createClient(store)
    getItem.mockReturnValue(registerScopeToken)
    await store.dispatch(checkAuth())

    testComponent = await createTestComponent(
      <OfficeHome
        match={{
          params: {
            tabId: WORKQUEUE_TABS.inProgress
          },
          isExact: true,
          path: '',
          url: ''
        }}
        staticContext={undefined}
        history={history}
        location={history.location}
      />,
      { store, history }
    )
  })
  it('renders page with team and performance tab for registration agent', async () => {
    const testComponent = await createTestComponent(
      <OfficeHome
        match={{
          params: { tabId: WORKQUEUE_TABS.inProgress },
          isExact: true,
          path: '',
          url: ''
        }}
        staticContext={undefined}
        history={history}
        location={history.location}
      />,
      { store, history, apolloClient: client }
    )
    expect(testComponent.exists('#navigation_team')).toBeTruthy()
    expect(testComponent.exists('#navigation_performance')).toBeTruthy()
    expect(testComponent.exists('#navigation_config_main')).toBeFalsy()
  })

  it('5 application tabs exists for registration agent', async () => {
    expect(testComponent.exists('#navigation_progress')).toBeTruthy()
    expect(testComponent.exists('#navigation_sentForReview')).toBeFalsy()
    expect(testComponent.exists('#navigation_readyForReview')).toBeTruthy()
    expect(testComponent.exists('#navigation_requiresUpdate')).toBeTruthy()
    expect(testComponent.exists('#navigation_print')).toBeTruthy()
    expect(testComponent.exists('#navigation_waitingValidation')).toBeTruthy()
    expect(testComponent.exists('#navigation_approvals')).toBeTruthy()
  })

  it('redirects when tabs are clicked', async () => {
    testComponent
      .find('#navigation_readyForReview')
      .hostNodes()
      .simulate('click')
    await flushPromises()
    expect(window.location.href).toContain('readyForReview')

    testComponent
      .find('#navigation_requiresUpdate')
      .hostNodes()
      .simulate('click')
    await flushPromises()
    expect(window.location.href).toContain('requiresUpdate')

    testComponent.find('#navigation_approvals').hostNodes().simulate('click')
    await flushPromises()
    expect(window.location.href).toContain('approvals')
  })
})

describe('Navigation for District Registrar related tests', () => {
  let testComponent: ReactWrapper<{}, {}>

  beforeEach(async () => {
    merge(mockUserResponse, nameObj)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
    ;({ store, history } = createStore())
    client = createClient(store)
    getItem.mockReturnValue(registerScopeToken)
    await store.dispatch(checkAuth())

    testComponent = await createTestComponent(
      <Navigation menuCollapse={() => {}} />,
      { store, history }
    )
  })
  it('settings and logout exists on navigation mobile view', async () => {
    expect(testComponent.exists('#navigation_settings')).toBeTruthy()
    expect(testComponent.exists('#navigation_logout')).toBeTruthy()
  })
})
