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
import { userMutations } from '@client/user/mutations'
import { UserAudit } from '@client/views/UserAudit/UserAudit'
import { getStorageUserDetailsSuccess } from '@client/profile/profileActions'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { vi } from 'vitest'
import { User, UUID } from '@opencrvs/commons/client'
import { useUsers } from '@client/v2-events/hooks/useUsers'

import { formatUrl } from '@client/navigation'
import { USER_PROFILE } from '@client/navigation/routes'
import { createMemoryRouter } from 'react-router-dom'

vi.mock('@client/v2-events/hooks/useUsers')

const mockAuditedUser: User = {
  type: 'user',
  id: '5d08e102542c7a19fc55b790',
  name: [
    {
      use: 'bn',
      given: [''],
      family: 'মায়ের পারিবারিক নাম'
    },
    {
      use: 'en',
      given: [''],
      family: 'Shakib al Hasan'
    }
  ],
  role: 'HOSPITAL_CLERK',
  primaryOfficeId: '895cc945-94a9-4195-9a29-22e9310f3385' as UUID,
  mobile: '+8801662132163',
  status: 'active'
}

describe.skip('User audit list tests for field agent', () => {
  userMutations.resendInvite = vi.fn()
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let router: ReturnType<typeof createMemoryRouter>

  beforeEach(async () => {
    Date.now = vi.fn(() => 1487076708000)
    vi.mocked(useUsers).mockImplementation(
      () =>
        ({
          getUser: {
            useQuery: () => ({
              data: mockAuditedUser,
              isFetching: false,
              error: null
            })
          }
        }) as unknown as ReturnType<typeof useUsers>
    )

    const { store: testStore } = await createTestStore()
    store = testStore
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
    ;({ component, router } = await createTestComponent(<UserAudit />, {
      store,
      path: USER_PROFILE,
      initialEntries: [
        formatUrl(USER_PROFILE, {
          userId: '5d08e102542c7a19fc55b790'
        })
      ],
      graphqlMocks: []
    }))
  })

  it('renders without crashing', async () => {
    expect(await waitForElement(component, '#office-link')).toBeDefined()
  })

  it('renders with a error toast for graphql error', async () => {
    vi.mocked(useUsers).mockImplementationOnce(
      () =>
        ({
          getUser: {
            useQuery: () => ({
              data: undefined,
              isFetching: false,
              error: new Error('GraphQL error')
            })
          }
        }) as unknown as ReturnType<typeof useUsers>
    )
    const { component: testComponent } = await createTestComponent(
      <UserAudit />,
      {
        store,
        graphqlMocks: []
      }
    )
    expect(await waitForElement(testComponent, '#error-toast')).toBeDefined()
  })

  it('clicking office link redirects user to userlist of primary office', async () => {
    const officeLink = await waitForElement(component, '#office-link')
    officeLink.hostNodes().simulate('click')

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    expect(router.state.location.pathname).toBe('/team/users')
  })
})

describe.skip('User audit list tests for sys admin', () => {
  userMutations.resendInvite = vi.fn()
  let component: ReactWrapper<{}, {}>
  let router: ReturnType<typeof createMemoryRouter>
  let store: AppStore

  beforeEach(async () => {
    Date.now = vi.fn(() => 1487076708000)

    const { store: testStore } = await createTestStore()
    store = testStore

    userDetails.primaryOfficeId = '895cc945-94a9-4195-9a29-22e9310f3385' as UUID
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
    setScopes(SYSTEM_ADMIN_DEFAULT_SCOPES, store)
    vi.mocked(useUsers).mockImplementation(
      () =>
        ({
          getUser: {
            useQuery: () => ({
              data: mockAuditedUser,
              isFetching: false,
              error: null
            })
          }
        }) as unknown as ReturnType<typeof useUsers>
    )

    const { component: testComponent, router: testRouter } =
      await createTestComponent(<UserAudit />, {
        store,
        path: USER_PROFILE,
        initialEntries: [
          formatUrl(USER_PROFILE, {
            userId: '5d08e102542c7a19fc55b790'
          })
        ],
        graphqlMocks: []
      })
    component = testComponent
    router = testRouter
  })

  it('redirects to edit user view on clicking edit details menu option', async () => {
    await waitForElement(component, '#office-link')

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

    expect(router.state.location.pathname).toBe(
      '/user/5d08e102542c7a19fc55b790/preview/'
    )
  })
})
