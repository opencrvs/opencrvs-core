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
import { AppStore } from '@client/store'
import {
  createTestComponent,
  createTestStore,
  flushPromises,
  setScopes,
  SYSTEM_ADMIN_DEFAULT_SCOPES,
  userDetails
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import * as React from 'react'
import { GET_USER } from '@client/user/queries'
import { UserAudit } from '@client/views/UserAudit/UserAudit'
import { userMutations } from '@client/user/mutations'
import { vi, Mock } from 'vitest'
import * as Router from 'react-router'
import { getStorageUserDetailsSuccess } from '@client/profile/profileActions'
import { GetUserQuery, Status } from '@client/utils/gateway'

const useParams = Router.useParams as Mock

const mockAuditedUserGqlResponse = {
  request: {
    query: GET_USER,
    variables: {
      userId: '5d08e102542c7a19fc55b790'
    }
  },
  result: {
    data: {
      getUser: {
        id: '5d08e102542c7a19fc55b790',
        name: [
          {
            use: 'bn',
            firstNames: '',
            familyName: 'মায়ের পারিবারিক নাম'
          },
          {
            use: 'en',
            firstNames: '',
            familyName: 'Shakib al Hasan'
          }
        ],
        username: 'shakib.alhasan',
        mobile: '+8801662132163',
        identifier: {
          system: 'NATIONAL_ID',
          value: '1014881922'
        },
        role: {
          id: 'SOCIAL_WORKER',
          label: {
            id: 'userRole.socialWorker',
            defaultMessage: 'Social Worker',
            description: 'Name for user role Social Worker',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        underInvestigation: true,
        practitionerId: '94429795-0a09-4de8-8e1e-27dab01877d2',
        primaryOffice: {
          id: '895cc945-94a9-4195-9a29-22e9310f3385',
          name: 'Narsingdi Paurasabha',
          alias: ['নরসিংদী পৌরসভা']
        },
        creationDate: '2019-03-31T18:00:00.000Z'
      } satisfies GetUserQuery['getUser']
    }
  }
}

describe('User audit list tests for field agent', () => {
  userMutations.resendInvite = vi.fn()
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History<any>

  beforeEach(async () => {
    Date.now = vi.fn(() => 1487076708000)

    useParams.mockImplementation(() => ({
      userId: '5d08e102542c7a19fc55b790'
    }))

    const { store: testStore, history: testHistory } = await createTestStore()
    store = testStore
    history = testHistory
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
    component = await createTestComponent(<UserAudit />, {
      store,
      history,
      graphqlMocks: [mockAuditedUserGqlResponse]
    })
  })

  it('renders without crashing', async () => {
    expect(await waitForElement(component, '#user-audit-list')).toBeDefined()
  })

  it('renders with a error toast for graphql error', async () => {
    const testComponent = await createTestComponent(<UserAudit />, {
      store,
      history,
      graphqlMocks: []
    })
    expect(await waitForElement(testComponent, '#error-toast')).toBeDefined()
  })

  it('clicking office link redirects user to userlist of primary office', async () => {
    const officeLink = await waitForElement(component, '#office-link')
    officeLink.hostNodes().simulate('click')

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    expect(history.location.pathname).toBe('/team/users')
  })
})

describe('User audit list tests for sys admin', () => {
  userMutations.resendInvite = vi.fn()
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History<any>

  beforeEach(async () => {
    Date.now = vi.fn(() => 1487076708000)

    useParams.mockImplementation(() => ({
      userId: '5d08e102542c7a19fc55b790'
    }))

    const { store: testStore, history: testHistory } = await createTestStore()
    store = testStore
    history = testHistory
    userDetails.primaryOffice = {
      id: '895cc945-94a9-4195-9a29-22e9310f3385',
      status: 'active',
      name: 'Narsingdi Paurasabha',
      alias: ['নরসিংদী পৌরসভা']
    }
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
    setScopes(SYSTEM_ADMIN_DEFAULT_SCOPES, store)
    component = await createTestComponent(<UserAudit />, {
      store,
      history,
      graphqlMocks: [mockAuditedUserGqlResponse]
    })
  })

  it.only('redirects to edit user view on clicking edit details menu option', async () => {
    await waitForElement(component, '#user-audit-list')

    const menuLink = await waitForElement(
      component,
      '#sub-page-header-munu-button-dropdownMenu'
    )
    menuLink.hostNodes().simulate('click')
    const editUserLink = (
      await waitForElement(
        component,
        '#sub-page-header-munu-button-Dropdown-Content'
      )
    )
      .find('li')
      .hostNodes()
      .at(0)
    editUserLink.hostNodes().simulate('click')

    // wait for mocked data to load mockedProvider
    await flushPromises()

    expect(history.location.pathname).toBe(
      '/user/5d08e102542c7a19fc55b790/preview/'
    )
  })
})
