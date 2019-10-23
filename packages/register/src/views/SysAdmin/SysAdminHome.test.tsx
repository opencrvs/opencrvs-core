import * as React from 'react'
import {
  createTestComponent,
  flushPromises,
  sysadminToken,
  mockUserResponse
} from '@register/tests/util'
import { queries } from '@register/profile/queries'
import { merge } from 'lodash'

import { storage } from '@register/storage'
import { createStore } from '@register/store'
import { checkAuth } from '@register/profile/profileActions'
import { SYS_ADMIN_ROLES } from '@register/utils/constants'
import { SysAdminHome } from './SysAdminHome'

const getItem = window.localStorage.getItem as jest.Mock

const mockFetchUserDetails = jest.fn()

const nameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Sahriar',
          familyName: 'Nafis',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      role: SYS_ADMIN_ROLES[0]
    }
  }
}

merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

storage.getItem = jest.fn()
storage.setItem = jest.fn()

describe('SysAdminHome tests', () => {
  const { store } = createStore()

  beforeAll(() => {
    getItem.mockReturnValue(sysadminToken)
    store.dispatch(checkAuth({ '?token': sysadminToken }))
  })

  it('renders page with top-bar', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <SysAdminHome
        match={{
          params: {
            tabId: 'users'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )
    const app = testComponent.component
    expect(app.find('#top-bar').hostNodes()).toHaveLength(1)
  })

  it('when user clicks the sent for users tab', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <SysAdminHome
        match={{
          params: {
            tabId: 'overview'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    testComponent.component
      .find('#tab_users')
      .hostNodes()
      .simulate('click')
    await flushPromises()

    testComponent.component.update()
    expect(window.location.href).toContain('sys-admin-home/users')
  })

  it('when user clicks the sent for overview tab', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <SysAdminHome
        match={{
          params: {
            tabId: 'users'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    testComponent.component
      .find('#tab_overview')
      .hostNodes()
      .simulate('click')
    await flushPromises()

    testComponent.component.update()
    expect(window.location.href).toContain('sys-admin-home/overview')
  })

  it('when user clicks the sent for offices tab', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <SysAdminHome
        match={{
          params: {
            tabId: 'overview'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    testComponent.component
      .find('#tab_offices')
      .hostNodes()
      .simulate('click')
    await flushPromises()

    testComponent.component.update()
    expect(window.location.href).toContain('sys-admin-home/offices')
  })

  it('when user clicks the sent for devices tab', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <SysAdminHome
        match={{
          params: {
            tabId: 'overview'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    testComponent.component
      .find('#tab_devices')
      .hostNodes()
      .simulate('click')
    await flushPromises()

    testComponent.component.update()
    expect(window.location.href).toContain('sys-admin-home/devices')
  })

  it('when user clicks the sent for network tab', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <SysAdminHome
        match={{
          params: {
            tabId: 'overview'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    testComponent.component
      .find('#tab_network')
      .hostNodes()
      .simulate('click')
    await flushPromises()

    testComponent.component.update()
    expect(window.location.href).toContain('sys-admin-home/network')
  })

  it('when user clicks the sent for config tab', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <SysAdminHome
        match={{
          params: {
            tabId: 'overview'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    testComponent.component
      .find('#tab_config')
      .hostNodes()
      .simulate('click')
    await flushPromises()

    testComponent.component.update()
    expect(window.location.href).toContain('sys-admin-home/config')
  })
})
