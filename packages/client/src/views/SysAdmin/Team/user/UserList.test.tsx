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
  mockRoles,
  setScopes,
  mockOfflineDataDispatch,
  fetchUserMock
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { SEARCH_USERS } from '@client/user/queries'
import { ReactWrapper } from 'enzyme'
import { stringify } from 'query-string'
import * as React from 'react'
import { UserList } from './UserList'
import { userMutations } from '@client/user/mutations'
import * as actions from '@client/profile/profileActions'
import { offlineDataReady } from '@client/offline/actions'
import { roleQueries } from '@client/forms/user/query/queries'
import { vi, Mock } from 'vitest'
import { SCOPES } from '@opencrvs/commons/client'
import { SearchUsersQuery, Status } from '@client/utils/gateway'
import { NetworkStatus } from '@apollo/client'
import { TEAM_USER_LIST } from '@client/navigation/routes'
import { createMemoryRouter } from 'react-router-dom'

const searchUserResultsMock = (
  officeId: string,
  searchUserResults?: NonNullable<SearchUsersQuery['searchUsers']>['results']
) => [
  {
    request: {
      query: SEARCH_USERS,
      variables: {
        primaryOfficeId: officeId,
        count: 10,
        skip: 0
      }
    },
    result: {
      data: {
        searchUsers: {
          totalItems: 0,
          results: searchUserResults ?? []
        }
      }
    }
  }
]

const mockRegistrationAgent = (officeId: string) => ({
  id: '5d08e102542c7a19fc55b790',
  name: [
    {
      use: 'en',
      firstNames: 'Rabindranath',
      familyName: 'Tagore'
    }
  ],
  primaryOffice: {
    id: officeId
  },
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
})
const mockNationalSystemAdmin = (officeId: string) => ({
  id: '5d08e102542c7a19fc55b791',
  name: [
    {
      use: 'en',
      firstNames: 'Mohammad',
      familyName: 'Ashraful'
    }
  ],
  primaryOffice: {
    id: officeId
  },
  role: {
    id: 'NATIONAL_SYSTEM_ADMIN',
    label: {
      id: 'userRoles.nationalSystemAdmin',
      defaultMessage: 'Natinoal System Admin',
      description: ''
    }
  },
  status: Status.Active,
  underInvestigation: false
})

describe('for user with create my jurisdiction scope', () => {
  let store: AppStore

  beforeEach(async () => {
    ;({ store } = createStore())
    setScopes([SCOPES.USER_CREATE_MY_JURISDICTION], store)
  })

  it('should show add user button if office is under jurisdiction', async () => {
    const userOfficeId = 'da672661-eb0a-437b-aa7a-a6d9a1711dd1'
    const selectedOfficeId = '0d8474da-0361-4d32-979e-af91f012340a' // This office is under the user's office in hierarchy

    const { component } = await createTestComponent(<UserList />, {
      store,
      path: TEAM_USER_LIST,
      initialEntries: [
        TEAM_USER_LIST +
          '?' +
          stringify({
            locationId: selectedOfficeId
          })
      ],
      graphqlMocks: searchUserResultsMock(selectedOfficeId)
    })
    store.dispatch(
      actions.setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(component.find('#add-user').hostNodes().length).toBe(1)
  })

  it('should not show add user button if office is not under jurisdiction', async () => {
    const userOfficeId = 'da672661-eb0a-437b-aa7a-a6d9a1711dd1'
    const selectedOfficeId = '213ec5f3-e306-4f95-8058-f37893dbfbb6' // This office is not under the user's office in hierarchy
    const { component } = await createTestComponent(<UserList />, {
      store,
      path: TEAM_USER_LIST,
      initialEntries: [
        TEAM_USER_LIST +
          '?' +
          stringify({
            locationId: selectedOfficeId
          })
      ],
      graphqlMocks: searchUserResultsMock(selectedOfficeId)
    })
    store.dispatch(
      actions.setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(component.find('#add-user').hostNodes().length).toBe(0)
  })
})

describe('for user with create scope', () => {
  let store: AppStore

  beforeEach(async () => {
    ;({ store } = createStore())
    setScopes([SCOPES.USER_CREATE], store)
  })

  it('should show add user button if office is under jurisdiction', async () => {
    const userOfficeId = 'da672661-eb0a-437b-aa7a-a6d9a1711dd1'
    const selectedOfficeId = '0d8474da-0361-4d32-979e-af91f012340a' // This office is under the user's office in hierarchy
    const { component } = await createTestComponent(<UserList />, {
      store,
      path: TEAM_USER_LIST,
      initialEntries: [
        TEAM_USER_LIST +
          '?' +
          stringify({
            locationId: selectedOfficeId
          })
      ],
      graphqlMocks: searchUserResultsMock(selectedOfficeId)
    })
    store.dispatch(
      actions.setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(component.find('#add-user').hostNodes().length).toBe(1)
  })

  it('should show add user button even if office is not under jurisdiction', async () => {
    const userOfficeId = 'da672661-eb0a-437b-aa7a-a6d9a1711dd1'
    const selectedOfficeId = '213ec5f3-e306-4f95-8058-f37893dbfbb6' // This office is not under the user's office in hierarchy
    const { component } = await createTestComponent(<UserList />, {
      store,
      path: TEAM_USER_LIST,
      initialEntries: [
        TEAM_USER_LIST +
          '?' +
          stringify({
            locationId: selectedOfficeId
          })
      ],
      graphqlMocks: searchUserResultsMock(selectedOfficeId)
    })
    store.dispatch(
      actions.setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(component.find('#add-user').hostNodes().length).toBe(1)
  })
})

describe('for user with update my jurisdiction scope', () => {
  let store: AppStore

  beforeEach(async () => {
    ;({ store } = createStore())
    setScopes([SCOPES.USER_UPDATE_MY_JURISDICTION], store)
    ;(roleQueries.fetchRoles as Mock).mockReturnValue(mockRoles)
  })

  it('should show edit user button if office is under jurisdiction', async () => {
    const userOfficeId = 'da672661-eb0a-437b-aa7a-a6d9a1711dd1'
    const selectedOfficeId = '0d8474da-0361-4d32-979e-af91f012340a' // This office is under the user's office in hierarchy
    const { component } = await createTestComponent(<UserList />, {
      store,
      path: TEAM_USER_LIST,
      initialEntries: [
        TEAM_USER_LIST +
          '?' +
          stringify({
            locationId: selectedOfficeId
          })
      ],
      graphqlMocks: searchUserResultsMock(selectedOfficeId, [
        mockRegistrationAgent(selectedOfficeId)
      ])
    })
    await flushPromises()
    store.dispatch(
      actions.setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(component.find('#user-item-0-menu').length >= 1).toBe(true)
  })

  it('should not show edit user button if the other user has update all scope even if under jurisdiction', async () => {
    const userOfficeId = 'da672661-eb0a-437b-aa7a-a6d9a1711dd1'
    const selectedOfficeId = '0d8474da-0361-4d32-979e-af91f012340a' // This office is under the user's office in hierarchy
    const { component } = await createTestComponent(<UserList />, {
      store,
      path: TEAM_USER_LIST,
      initialEntries: [
        TEAM_USER_LIST +
          '?' +
          stringify({
            locationId: selectedOfficeId
          })
      ],
      graphqlMocks: searchUserResultsMock(selectedOfficeId, [
        mockNationalSystemAdmin(selectedOfficeId)
      ])
    })
    await flushPromises()
    store.dispatch(
      actions.setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(component.find('#user-item-0-menu').length >= 1).toBe(false)
  })

  it('should not show edit user button if office is not under jurisdiction', async () => {
    const userOfficeId = 'da672661-eb0a-437b-aa7a-a6d9a1711dd1'
    const selectedOfficeId = '213ec5f3-e306-4f95-8058-f37893dbfbb6' // This office is not under the user's office in hierarchy
    const { component } = await createTestComponent(<UserList />, {
      store,
      path: TEAM_USER_LIST,
      initialEntries: [
        TEAM_USER_LIST +
          '?' +
          stringify({
            locationId: selectedOfficeId
          })
      ],
      graphqlMocks: searchUserResultsMock(selectedOfficeId, [
        mockRegistrationAgent(selectedOfficeId)
      ])
    })

    await flushPromises()
    store.dispatch(
      actions.setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(component.find('#user-item-0-menu').length >= 1).toBe(false)
  })
})

describe('for user with update scope', () => {
  let store: AppStore

  beforeEach(async () => {
    ;({ store } = createStore())
    setScopes([SCOPES.USER_UPDATE], store)
    ;(roleQueries.fetchRoles as Mock).mockReturnValue(mockRoles)
  })

  it('should show edit user button if office is under jurisdiction', async () => {
    const userOfficeId = 'da672661-eb0a-437b-aa7a-a6d9a1711dd1'
    const selectedOfficeId = '0d8474da-0361-4d32-979e-af91f012340a' // This office is under the user's office in hierarchy
    const { component } = await createTestComponent(<UserList />, {
      store,
      path: TEAM_USER_LIST,
      initialEntries: [
        TEAM_USER_LIST +
          '?' +
          stringify({
            locationId: selectedOfficeId
          })
      ],
      graphqlMocks: searchUserResultsMock(selectedOfficeId, [
        mockRegistrationAgent(selectedOfficeId)
      ])
    })
    await flushPromises()
    store.dispatch(
      actions.setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(component.find('#user-item-0-menu').length >= 1).toBe(true)
  })

  it('should show edit user button even if the other user has update all scope', async () => {
    const userOfficeId = 'da672661-eb0a-437b-aa7a-a6d9a1711dd1'
    const selectedOfficeId = '0d8474da-0361-4d32-979e-af91f012340a' // This office is under the user's office in hierarchy
    const { component } = await createTestComponent(<UserList />, {
      store,
      path: TEAM_USER_LIST,
      initialEntries: [
        TEAM_USER_LIST +
          '?' +
          stringify({
            locationId: selectedOfficeId
          })
      ],
      graphqlMocks: searchUserResultsMock(selectedOfficeId, [
        mockNationalSystemAdmin(selectedOfficeId)
      ])
    })
    await flushPromises()
    store.dispatch(
      actions.setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(component.find('#user-item-0-menu').length >= 1).toBe(true)
  })

  it('should show edit user button even if office is not under jurisdiction', async () => {
    const userOfficeId = 'da672661-eb0a-437b-aa7a-a6d9a1711dd1'
    const selectedOfficeId = '213ec5f3-e306-4f95-8058-f37893dbfbb6' // This office is not under the user's office in hierarchy
    const { component } = await createTestComponent(<UserList />, {
      store,
      path: TEAM_USER_LIST,
      initialEntries: [
        TEAM_USER_LIST +
          '?' +
          stringify({
            locationId: selectedOfficeId
          })
      ],
      graphqlMocks: searchUserResultsMock(selectedOfficeId, [
        mockRegistrationAgent(selectedOfficeId)
      ])
    })
    await flushPromises()
    store.dispatch(
      actions.setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(component.find('#user-item-0-menu').length >= 1).toBe(true)
  })
})

describe('User list tests', () => {
  let store: AppStore

  beforeAll(async () => {
    Date.now = vi.fn(() => 1487076708000)
    ;({ store } = createStore())
    setScopes([SCOPES.USER_UPDATE, SCOPES.USER_CREATE], store)

    const action = {
      type: actions.SET_USER_DETAILS,
      payload: mockLocalSysAdminUserResponse
    }
    store.dispatch(action)
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
      const { component, router } = await createTestComponent(<UserList />, {
        store,
        path: TEAM_USER_LIST,
        initialEntries: [
          TEAM_USER_LIST +
            '?' +
            stringify({
              locationId: '0d8474da-0361-4d32-979e-af91f012340a'
            })
        ],
        graphqlMocks: userListMock
      })
      component.update()
      const addUser = await waitForElement(component, '#add-user')
      addUser.hostNodes().simulate('click')

      component.update()

      expect(router.state.location.pathname).toContain('/createUserInLocation')
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
      const { component, router } = await createTestComponent(<UserList />, {
        store,
        path: TEAM_USER_LIST,
        initialEntries: [
          TEAM_USER_LIST +
            '?' +
            stringify({
              locationId: '0d8474da-0361-4d32-979e-af91f012340a'
            })
        ],
        graphqlMocks: userListMock
      })
      component.update()

      const addUser = await waitForElement(component, '#add-user')
      addUser.hostNodes().simulate('click')

      component.update()

      expect(router.state.location.pathname).toContain('/createUser')
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
      const testComponent = await createTestComponent(<UserList />, {
        store,
        path: TEAM_USER_LIST,
        initialEntries: [
          TEAM_USER_LIST +
            '?' +
            stringify({
              locationId: '0d8474da-0361-4d32-979e-af91f012340a'
            })
        ],
        graphqlMocks: userListMock
      })

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const app = testComponent.component
      expect(app.find('#no-record').hostNodes()).toHaveLength(1)
    })

    describe('when there is a result from query', () => {
      userMutations.resendInvite = vi.fn()
      userMutations.usernameReminderSend = vi.fn()
      userMutations.sendResetPasswordInvite = vi.fn()
      let component: ReactWrapper<{}, {}>
      let router: ReturnType<typeof createMemoryRouter>
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
                    primaryOffice: {
                      id: '0d8474da-0361-4d32-979e-af91f012340a'
                    },
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
                    primaryOffice: {
                      id: '0d8474da-0361-4d32-979e-af91f012340a'
                    },
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
                    primaryOffice: {
                      id: '0d8474da-0361-4d32-979e-af91f012340a'
                    },
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
                    primaryOffice: {
                      id: '0d8474da-0361-4d32-979e-af91f012340a'
                    },
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
                    primaryOffice: {
                      id: '0d8474da-0361-4d32-979e-af91f012340a'
                    },
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
        const testComponent = await createTestComponent(<UserList />, {
          store,
          path: TEAM_USER_LIST,
          initialEntries: [
            TEAM_USER_LIST +
              '?' +
              stringify({
                locationId: '0d8474da-0361-4d32-979e-af91f012340a'
              })
          ],
          graphqlMocks: userListMock
        })

        // wait for mocked data to load mockedProvider
        await new Promise((resolve) => {
          setTimeout(resolve, 100)
        })

        testComponent.component.update()
        component = testComponent.component
        router = testComponent.router
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
        expect(router.state.location.pathname).toMatch(
          /.user\/(\w)+\/preview\/*/
        )
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
