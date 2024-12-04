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
import { AppStore, createStore } from '@client/store'
import {
  mockLocalSysAdminUserResponse,
  createTestComponent,
  flushPromises,
  setScopes,
  mockOfflineDataDispatch,
  mockUserResponse
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { SEARCH_USERS } from '@client/user/queries'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { stringify } from 'query-string'
import * as React from 'react'
import { UserList } from './UserList'
import { userMutations } from '@client/user/mutations'
import * as actions from '@client/profile/profileActions'
import { offlineDataReady } from '@client/offline/actions'

import { vi, Mock } from 'vitest'
import { SCOPES } from '@opencrvs/commons/client'
import { SearchUsersQuery, Status } from '@client/utils/gateway'

describe('user list without admin scope', () => {
  let store: AppStore
  let history: History<any>

  it('no add user button', async () => {
    Date.now = vi.fn(() => 1487076708000)
    ;({ store, history } = await createStore())
    const action = {
      type: actions.SET_USER_DETAILS,
      payload: mockUserResponse
    }
    await store.dispatch(action)
    store.dispatch(offlineDataReady(mockOfflineDataDispatch))
    await flushPromises()

    const userListMock = [
      {
        request: {
          query: SEARCH_USERS,
          variables: {
            primaryOfficeId: '65cf62cb-864c-45e3-9c0d-5c70f0074cb4',
            count: 10
          }
        },
        result: {
          data: {
            searchUsers: {
              totalItems: 0,
              results: []
            }
          }
        }
      }
    ]

    const component = await createTestComponent(
      <UserList
        // @ts-ignore
        location={{
          search: stringify({
            locationId: '0d8474da-0361-4d32-979e-af91f012340a'
          })
        }}
      />,
      { store, history, graphqlMocks: userListMock }
    )
    component.update()
    expect(component.find('#add-user').length).toBe(0)
  })
})

describe('User list tests', () => {
  let store: AppStore
  let history: History<any>

  beforeAll(async () => {
    Date.now = vi.fn(() => 1487076708000)
    ;({ store, history } = await createStore())
    setScopes([SCOPES.USER_UPDATE, SCOPES.USER_CREATE], store)

    const action = {
      type: actions.SET_USER_DETAILS,
      payload: mockLocalSysAdminUserResponse
    }
    await store.dispatch(action)
    store.dispatch(offlineDataReady(mockOfflineDataDispatch))
    await flushPromises()
  })

  describe('Header test', () => {
    it('add user button redirects to user form', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              primaryOfficeId: '0d8474da-0361-4d32-979e-af91f012340a',
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 0,
                results: []
              }
            }
          }
        }
      ]
      const component = await createTestComponent(
        <UserList
          // @ts-ignore
          location={{
            search: stringify({
              locationId: '0d8474da-0361-4d32-979e-af91f012340a'
            })
          }}
        />,
        { store, history, graphqlMocks: userListMock }
      )
      component.update()
      const addUser = await waitForElement(component, '#add-user')
      addUser.hostNodes().simulate('click')

      component.update()

      expect(history.location.pathname).toContain('/createUserInLocation')
    })
    it('add user button redirects to office selection form for invalid location id', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              primaryOfficeId: '0d8474da-0361-4d32-979e-af91f012340a',
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 0,
                results: []
              }
            }
          }
        }
      ]
      const component = await createTestComponent(
        <UserList
          // @ts-ignore
          location={{
            search: stringify({
              locationId: '0d8474da-0361-4d32-979e-af91f012340a'
            })
          }}
        />,
        { store, history, graphqlMocks: userListMock }
      )
      component.update()

      const addUser = await waitForElement(component, '#add-user')
      addUser.hostNodes().simulate('click')

      component.update()

      expect(history.location.pathname).toContain('/createUser')
    })
  })

  describe('Table test', () => {
    it('renders no result text for empty user list in response', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              primaryOfficeId: '0d8474da-0361-4d32-979e-af91f012340a',
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 0,
                results: []
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
        // @ts-ignore
        <UserList
          // @ts-ignore
          location={{
            search: stringify({
              locationId: '0d8474da-0361-4d32-979e-af91f012340a'
            })
          }}
        />,
        { store, history, graphqlMocks: userListMock }
      )

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })

      testComponent.update()
      const app = testComponent
      expect(app.find('#no-record').hostNodes()).toHaveLength(1)
    })

    describe('when there is a result from query', () => {
      userMutations.resendInvite = vi.fn()
      userMutations.usernameReminderSend = vi.fn()
      userMutations.sendResetPasswordInvite = vi.fn()
      let component: ReactWrapper<{}, {}>
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              primaryOfficeId: '0d8474da-0361-4d32-979e-af91f012340a',
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 5,
                results: [
                  {
                    id: '5d08e102542c7a19fc55b790',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Rabindranath',
                        familyName: 'Tagore'
                      }
                    ],
                    username: 'r.tagore',
                    role: {
                      id: 'REGISTRATION_AGENT',
                      label: {
                        id: 'userRoles.registrationAgent',
                        defaultMessage: 'Registration_agent',
                        description: ''
                      }
                    },
                    status: Status.Active,
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b791',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    username: 'm.ashraful',
                    role: {
                      id: 'LOCAL_REGISTRAR',
                      label: {
                        id: 'userRoles.localRegistrar',
                        defaultMessage: 'Local Registrar',
                        description: ''
                      }
                    },
                    status: Status.Active,
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b792',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Muhammad Abdul',
                        familyName: 'Muid Khan'
                      }
                    ],
                    username: 'ma.muidkhan',
                    role: {
                      id: 'DISTRICT_REGISTRAR',
                      label: {
                        id: 'userRoles.districtRegistrar',
                        defaultMessage: 'District Registrar',
                        description: ''
                      }
                    },
                    status: Status.Pending,
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b793',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Nasreen Pervin',
                        familyName: 'Huq'
                      }
                    ],
                    username: 'np.huq',
                    role: {
                      id: 'STATE_REGISTRAR',
                      label: {
                        id: 'userRoles.stateRegistrar',
                        defaultMessage: 'State Registrar',
                        description: ''
                      }
                    },
                    status: Status.Deactivated,
                    underInvestigation: true
                  },
                  {
                    id: '5d08e102542c7a19fc55b795',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ariful',
                        familyName: 'Islam'
                      }
                    ],
                    username: 'ma.islam',
                    role: {
                      id: 'FIELD_AGENT',
                      label: {
                        id: 'userRoles.fieldAgent',
                        defaultMessage: 'Field Agent',
                        description: ''
                      }
                    },
                    status: Status.Disabled,
                    underInvestigation: false
                  }
                ]
              } satisfies SearchUsersQuery['searchUsers']
            }
          }
        }
      ]

      beforeEach(async () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1100
        })
        const testComponent = await createTestComponent(
          <UserList
            // @ts-ignore
            location={{
              search: stringify({
                locationId: '0d8474da-0361-4d32-979e-af91f012340a'
              })
            }}
          />,
          { store, history, graphqlMocks: userListMock }
        )

        // wait for mocked data to load mockedProvider
        await new Promise((resolve) => {
          setTimeout(resolve, 100)
        })

        testComponent.update()
        component = testComponent
      })

      it('renders list of users', () => {
        expect(component.find('#user_list').hostNodes()).toHaveLength(1)
      })

      it('clicking on toggleMenu pops up menu options', async () => {
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-0-menu-dropdownMenu'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = (
          await waitForElement(component, '#user-item-0-menu-Dropdown-Content')
        )
          .find('li')
          .hostNodes()
          .at(0)
        expect(menuOptionButton.hostNodes()).toHaveLength(1)
      })

      it('clicking on menu options takes to user review page', async () => {
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-0-menu-dropdownMenu'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = (
          await waitForElement(component, '#user-item-0-menu-Dropdown-Content')
        )
          .find('li')
          .hostNodes()
          .at(0)
        menuOptionButton.hostNodes().simulate('click')
        await flushPromises()
        expect(history.location.pathname).toMatch(/.user\/(\w)+\/preview\/*/)
      })

      it('clicking on menu options Resend invite sends invite', async () => {
        ;(userMutations.resendInvite as Mock).mockResolvedValueOnce({
          data: { resendInvite: 'true' }
        })
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-2-menu-dropdownMenu'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = (
          await waitForElement(component, '#user-item-2-menu-Dropdown-Content')
        )
          .find('li')
          .hostNodes()
          .at(3)

        expect(menuOptionButton.hostNodes().text().trim()).toBe('Resend invite')
        menuOptionButton.hostNodes().simulate('click')
        await flushPromises()
        component.update()
        await waitForElement(component, '#resend_invite_success')
      })

      it('clicking on menu options Resend invite shows error if any submission error', async () => {
        ;(userMutations.resendInvite as Mock).mockRejectedValueOnce(
          new Error('Something went wrong')
        )
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-2-menu-dropdownMenu'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = (
          await waitForElement(component, '#user-item-2-menu-Dropdown-Content')
        )
          .find('li')
          .hostNodes()
          .at(3)
        expect(menuOptionButton.hostNodes().text().trim()).toBe('Resend invite')
        menuOptionButton.hostNodes().simulate('click')
        await flushPromises()
        component.update()
        await waitForElement(component, '#resend_invite_error')
      })

      it('clicking on menu options deactivate to user pops up audit action modal', async () => {
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-1-menu-dropdownMenu'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = (
          await waitForElement(component, '#user-item-1-menu-Dropdown-Content')
        )
          .find('li')
          .hostNodes()
          .at(3)
        expect(menuOptionButton.hostNodes().text().trim()).toBe('Deactivate')
        menuOptionButton.first().simulate('click')
        component.update()
        expect(component.exists('#user-audit-modal')).toBeTruthy()
      })

      it('clicking on menu options Send username reminder pop up confirmation modal', async () => {
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-1-menu-dropdownMenu'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = (
          await waitForElement(component, '#user-item-1-menu-Dropdown-Content')
        )
          .find('li')
          .hostNodes()
          .at(1)

        expect(menuOptionButton.hostNodes().text().trim()).toBe(
          'Send username reminder'
        )
        menuOptionButton.hostNodes().simulate('click')
        await flushPromises()
        component.update()
        expect(component.exists('#username-reminder-modal')).toBeTruthy()
      })

      it('will send username after clicking on send button shows on modal', async () => {
        ;(userMutations.usernameReminderSend as Mock).mockResolvedValueOnce({
          data: { usernameReminder: 'iModupsy' }
        })
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-1-menu-dropdownMenu'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = (
          await waitForElement(component, '#user-item-1-menu-Dropdown-Content')
        )
          .find('li')
          .hostNodes()
          .at(1)
        expect(menuOptionButton.hostNodes().text().trim()).toBe(
          'Send username reminder'
        )
        menuOptionButton.hostNodes().simulate('click')
        component.update()
        expect(component.exists('#username-reminder-modal')).toBeTruthy()
        const sendButton = await waitForElement(
          component,
          '#username-reminder-send'
        )
        sendButton.hostNodes().simulate('click')
        component.update()
        await waitForElement(component, '#username_reminder_success')
      })

      it('clicking username reminder send button shows error if any submission error', async () => {
        ;(userMutations.usernameReminderSend as Mock).mockRejectedValueOnce(
          new Error('Something went wrong')
        )
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-1-menu-dropdownMenu'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = (
          await waitForElement(component, '#user-item-1-menu-Dropdown-Content')
        )
          .find('li')
          .hostNodes()
          .at(1)
        expect(menuOptionButton.hostNodes().text().trim()).toBe(
          'Send username reminder'
        )
        menuOptionButton.hostNodes().simulate('click')
        component.update()
        expect(component.exists('#username-reminder-modal')).toBeTruthy()
        const sendButton = await waitForElement(
          component,
          '#username-reminder-send'
        )
        sendButton.hostNodes().simulate('click')
        component.update()
        await waitForElement(component, '#username_reminder_error')
      })

      it('clicking on menu options reactivate to user pops up audit action modal', async () => {
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-3-menu-dropdownMenu'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = (
          await waitForElement(component, '#user-item-3-menu-Dropdown-Content')
        )
          .find('li')
          .hostNodes()
          .at(1)
        expect(menuOptionButton.hostNodes().text().trim()).toBe('Reactivate')
        menuOptionButton.first().simulate('click')
        component.update()
        expect(component.exists('#user-audit-modal')).toBeTruthy()
      })

      it('clicking on menu options Reset Password pop up confirmation modal', async () => {
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-1-menu-dropdownMenu'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = (
          await waitForElement(component, '#user-item-1-menu-Dropdown-Content')
        )
          .find('li')
          .hostNodes()
          .at(2)
        expect(menuOptionButton.hostNodes().text().trim()).toBe(
          'Reset Password'
        )
        menuOptionButton.hostNodes().simulate('click')
        await flushPromises()
        component.update()
        expect(component.exists('#user-reset-password-modal')).toBeTruthy()
      })

      it('will reset password after clicking on send button shows on modal', async () => {
        ;(userMutations.sendResetPasswordInvite as Mock).mockResolvedValueOnce({
          data: { resetPasswordInvite: 'sadman.anik' }
        })
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-1-menu-dropdownMenu'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = (
          await waitForElement(component, '#user-item-1-menu-Dropdown-Content')
        )
          .find('li')
          .hostNodes()
          .at(2)

        expect(menuOptionButton.hostNodes().text().trim()).toBe(
          'Reset Password'
        )
        menuOptionButton.hostNodes().simulate('click')
        component.update()
        expect(component.exists('#user-reset-password-modal')).toBeTruthy()
        const sendButton = await waitForElement(
          component,
          '#reset-password-send'
        )
        sendButton.hostNodes().simulate('click')
        component.update()
        await waitForElement(component, '#reset_password_success')
      })

      it('clicking reset password send button shows error if any submission error', async () => {
        ;(userMutations.sendResetPasswordInvite as Mock).mockRejectedValueOnce(
          new Error('Something went wrong')
        )
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-1-menu-dropdownMenu'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = (
          await waitForElement(component, '#user-item-1-menu-Dropdown-Content')
        )
          .find('li')
          .hostNodes()
          .at(2)
        expect(menuOptionButton.hostNodes().text().trim()).toBe(
          'Reset Password'
        )
        menuOptionButton.hostNodes().simulate('click')
        component.update()
        expect(component.exists('#user-reset-password-modal')).toBeTruthy()
        const sendButton = await waitForElement(
          component,
          '#reset-password-send'
        )
        sendButton.hostNodes().simulate('click')
        component.update()
        await waitForElement(component, '#reset_password_error')
      })
    })
  })
})
