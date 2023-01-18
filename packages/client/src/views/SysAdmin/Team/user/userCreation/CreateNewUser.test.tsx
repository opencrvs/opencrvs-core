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
import { FormFieldGenerator } from '@client/components/form'
import { roleQueries } from '@client/forms/user/query/queries'
import { offlineDataReady } from '@client/offline/actions'
import { AppStore, createStore } from '@client/store'
import { userQueries, GET_USER } from '@client/user/queries'
import {
  createTestComponent,
  flushPromises,
  loginAsFieldAgent,
  mockCompleteFormData,
  mockDataWithRegistarRoleSelected,
  mockOfflineData,
  mockOfflineDataDispatch
} from '@client/tests/util'
import { modifyUserFormData } from '@client/user/userReducer'
import { CreateNewUser } from '@client/views/SysAdmin/Team/user/userCreation/CreateNewUser'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import {
  REVIEW_USER_FORM,
  REVIEW_USER_DETAILS
} from '@client/navigation/routes'
import { UserSection } from '@client/forms'
import { waitForElement } from '@client/tests/wait-for-element'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { History } from 'history'
import { vi, Mock } from 'vitest'

export const mockRoles = {
  data: {
    getSystemRoles: [
      {
        value: 'FIELD_AGENT',
        roles: [
          {
            lang: 'en',
            label: 'Healthcare Worker'
          },
          {
            lang: 'fr',
            label: 'Professionnel de Santé'
          },
          {
            lang: 'en',
            label: 'Police Officer'
          },
          {
            lang: 'fr',
            label: 'Agent de Police'
          },
          {
            lang: 'en',
            label: 'Social Worker'
          },
          {
            lang: 'fr',
            label: 'Travailleur Social'
          },
          {
            lang: 'en',
            label: 'Local Leader'
          },
          {
            lang: 'fr',
            label: 'Leader Local'
          }
        ],
        __typename: 'Role'
      },
      {
        value: 'REGISTRATION_AGENT',
        roles: [
          {
            lang: 'en',
            label: 'Registration Agent'
          },
          {
            lang: 'fr',
            label: "Agent d'enregistrement"
          }
        ],
        __typename: 'Role'
      },
      {
        value: 'LOCAL_REGISTRAR',
        roles: [
          {
            lang: 'en',
            label: 'Local Registrar'
          },
          {
            lang: 'fr',
            label: 'Registraire local'
          }
        ],
        __typename: 'Role'
      },
      {
        value: 'LOCAL_SYSTEM_ADMIN',
        roles: [
          {
            lang: 'en',
            label: 'Local System_admin'
          },
          {
            lang: 'fr',
            label: 'Administrateur système local'
          }
        ],
        __typename: 'Role'
      },
      {
        value: 'NATIONAL_SYSTEM_ADMIN',
        roles: [
          {
            lang: 'en',
            label: 'National System_admin'
          },
          {
            lang: 'fr',
            label: 'Administrateur système national'
          }
        ],
        __typename: 'Role'
      },
      {
        value: 'PERFORMANCE_MANAGEMENT',
        roles: [
          {
            lang: 'en',
            label: 'Performance Management'
          },
          {
            lang: 'fr',
            label: 'Gestion des performances'
          }
        ],
        __typename: 'Role'
      },
      {
        value: 'NATIONAL_REGISTRAR',
        roles: [
          {
            lang: 'en',
            label: 'National Registrar'
          },
          {
            lang: 'fr',
            label: 'Registraire national'
          }
        ],
        __typename: 'Role'
      }
    ]
  }
}

export const mockUsers = {
  data: {
    searchUsers: {
      totalItems: 8,
      results: [
        {
          id: '5db9f3fdd2ce28e4e2da1a7e',
          name: [
            {
              use: 'en',
              firstNames: 'API',
              familyName: 'User',
              __typename: 'HumanName'
            }
          ],
          username: 'api.user',
          systemRole: 'API_USER',
          role: 'API_USER',
          status: 'active',
          __typename: 'User'
        },
        {
          id: '5db9f3fcd2ce28e4e2da1a7d',
          name: [
            {
              use: 'en',
              firstNames: 'Sahriar',
              familyName: 'Nafis',
              __typename: 'HumanName'
            }
          ],
          username: 'shahriar.nafis',
          systemRole: 'LOCAL_SYSTEM_ADMIN',
          role: 'LOCAL_SYSTEM_ADMIN',
          status: 'active',
          __typename: 'User'
        },
        {
          id: '5db9f3fcd2ce28e4e2da1a7c',
          name: [
            {
              use: 'en',
              firstNames: 'Mohamed',
              familyName: 'Abu Abdullah',
              __typename: 'HumanName'
            }
          ],
          username: 'mohamed.abu',
          systemRole: 'NATIONAL_REGISTRAR',
          role: 'SECRETARY',
          status: 'active',
          __typename: 'User'
        },
        {
          id: '5db9f3fcd2ce28e4e2da1a7b',
          name: [
            {
              use: 'en',
              firstNames: 'Nasreen Pervin',
              familyName: 'Huq',
              __typename: 'HumanName'
            }
          ],
          username: 'nasreen.pervin',
          systemRole: 'STATE_REGISTRAR',
          role: 'MAYOR',
          status: 'active',
          __typename: 'User'
        },
        {
          id: '5db9f3fcd2ce28e4e2da1a7a',
          name: [
            {
              use: 'en',
              firstNames: 'Muhammad Abdul Muid',
              familyName: 'Khan',
              __typename: 'HumanName'
            }
          ],
          username: 'muid.khan',
          systemRole: 'DISTRICT_REGISTRAR',
          role: 'MAYOR',
          status: 'active',
          __typename: 'User'
        },
        {
          id: '5db9f3fcd2ce28e4e2da1a79',
          name: [
            {
              use: 'en',
              firstNames: 'Mohammad',
              familyName: 'Ashraful',
              __typename: 'HumanName'
            }
          ],
          username: 'mohammad.ashraful',
          systemRole: 'LOCAL_REGISTRAR',
          role: 'CHAIRMAN',
          status: 'active',
          __typename: 'User'
        },
        {
          id: '5db9f3fcd2ce28e4e2da1a78',
          name: [
            {
              use: 'en',
              firstNames: 'Tamim',
              familyName: 'Iqbal',
              __typename: 'HumanName'
            }
          ],
          username: 'tamim.iqbal',
          systemRole: 'REGISTRATION_AGENT',
          role: 'ENTREPENEUR',
          status: 'active',
          __typename: 'User'
        },
        {
          id: '5db9f3fcd2ce28e4e2da1a77',
          name: [
            {
              use: 'en',
              firstNames: 'Shakib',
              familyName: 'Al Hasan',
              __typename: 'HumanName'
            }
          ],
          username: 'sakibal.hasan',
          systemRole: 'FIELD_AGENT',
          role: 'CHA',
          status: 'active',
          __typename: 'User'
        }
      ],
      __typename: 'SearchUserResult'
    }
  }
}

describe('create new user tests', () => {
  let store: AppStore
  let history: History
  let testComponent: ReactWrapper

  beforeEach(async () => {
    ;(roleQueries.fetchRoles as Mock).mockReturnValue(mockRoles)
    ;(userQueries.searchUsers as Mock).mockReturnValue(mockUsers)
    const s = createStore()
    store = s.store
    history = s.history
  })

  describe('when user is in create new user form', () => {
    beforeEach(async () => {
      testComponent = await createTestComponent(
        <CreateNewUser
          match={{
            // @ts-ignore
            params: {
              locationId: '0d8474da-0361-4d32-979e-af91f012340a',
              sectionId: mockOfflineData.forms.userForm.sections[0].id
            },
            isExact: true,
            path: '/createUser',
            url: ''
          }}
        />,
        { store, history }
      )

      loginAsFieldAgent(store)
    })

    it('clicking on confirm button with unfilled required fields shows validation errors', async () => {
      await waitForElement(testComponent, '#confirm_form')

      testComponent.find('#confirm_form').hostNodes().simulate('click')

      await flushPromises()
      testComponent.update()

      expect(
        testComponent
          .find(FormFieldGenerator)
          .find('#phoneNumber_error')
          .hostNodes()
          .text()
      ).toBe('Required to register a new user')
    })

    it('clicking on confirm button with complete data takes user to preview page', async () => {
      store.dispatch(modifyUserFormData(mockCompleteFormData))
      await waitForElement(testComponent, '#confirm_form')
      testComponent.find('#confirm_form').hostNodes().simulate('click')
      await flushPromises()

      expect(history.location.pathname).toContain('preview')
    })

    it('clicking on confirm by selecting registrar as role will go to signature form page', async () => {
      store.dispatch(modifyUserFormData(mockDataWithRegistarRoleSelected))
      await waitForElement(testComponent, '#confirm_form')
      testComponent.find('#confirm_form').hostNodes().simulate('click')
      await flushPromises()

      expect(history.location.pathname).toContain(
        '/createUser/user/signature-attachment'
      )
    })
  })

  describe('when user in review page', () => {
    beforeEach(async () => {
      store.dispatch(modifyUserFormData(mockCompleteFormData))
      // store.dispatch(processRoles(mockCompleteFormData.registrationOffice))
      testComponent = await createTestComponent(
        // @ts-ignore
        <CreateNewUser
          match={{
            params: {
              sectionId: mockOfflineData.forms.userForm.sections[1].id,
              groupId: mockOfflineData.forms.userForm.sections[1].groups[0].id
            },
            isExact: true,
            path: '/createUser',
            url: ''
          }}
        />,
        { store, history }
      )
    })

    it('renders review header', () => {
      expect(testComponent.find('#content-name').hostNodes().text()).toBe(
        'Please review the new users details'
      )
    })

    it('clicking change button on a field takes user back to form', async () => {
      testComponent
        .find('#btn_change_firstNamesEng')
        .hostNodes()
        .first()
        .simulate('click')
      await flushPromises()
      expect(history.location.pathname).toBe('/createUser/user/user-view-group')
      expect(history.location.hash).toBe('#firstNamesEng')
    })

    it('clicking submit button submits the form data', async () => {
      testComponent.find('#submit_user_form').hostNodes().simulate('click')

      await flushPromises()

      expect(store.getState().userForm.submitting).toBe(false)
    })
  })
})

describe('edit user tests', () => {
  const { store, history } = createStore()
  let component: ReactWrapper<{}, {}>
  const submitMock: Mock = vi.fn()

  const graphqlMocks = [
    {
      request: {
        query: GET_USER,
        variables: { userId: '5e835e4d81fbf01e4dc554db' }
      },
      result: {
        data: {
          getUser: {
            id: '5e835e4d81fbf01e4dc554db',
            name: [
              {
                use: 'bn',
                firstNames: 'Jeff',
                familyName: 'মায়ের পারিবারিক নাম ',
                __typename: 'HumanName'
              },
              {
                use: 'en',
                firstNames: 'Jeff',
                familyName: 'Shakib al Hasan',
                __typename: 'HumanName'
              }
            ],
            username: 'shakib1',
            mobile: '+8801662132163',
            identifier: {
              system: 'NATIONAL_ID',
              value: '101488192',
              __typename: 'Identifier'
            },
            systemRole: 'API_USER',
            role: 'API_USER',
            status: 'active',
            underInvestigation: false,
            practitionerId: '94429795-0a09-4de8-8e1e-27dab01877d2',
            primaryOffice: {
              id: '895cc945-94a9-4195-9a29-22e9310f3385',
              name: 'Narsingdi Paurasabha',
              alias: ['নরসিংদী পৌরসভা'],
              __typename: 'Location'
            },
            catchmentArea: [
              {
                id: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
                name: 'Sample location',
                alias: 'স্যাম্পল লোকেশান'
              }
            ],
            signature: null,
            creationDate: '2019-03-31T18:00:00.000Z',
            __typename: 'User'
          }
        }
      }
    }
  ]

  beforeEach(() => {
    ;(roleQueries.fetchRoles as Mock).mockReturnValue(mockRoles)
    ;(userQueries.searchUsers as Mock).mockReturnValue(mockUsers)
    store.dispatch(offlineDataReady(mockOfflineDataDispatch))
  })

  describe('when user is in update form page', () => {
    beforeEach(async () => {
      const testComponent = await createTestComponent(
        // @ts-ignore
        <CreateNewUser
          match={{
            params: {
              userId: '5e835e4d81fbf01e4dc554db',
              sectionId: UserSection.User,
              groupId: 'user-view-group'
            },
            isExact: true,
            path: REVIEW_USER_FORM,
            url: ''
          }}
        />,
        { store, history, graphqlMocks: graphqlMocks }
      )

      component = testComponent
    })

    it('clicking on continue button takes user review details page', async () => {
      const continueButtonElement = await waitForElement(
        component,
        '#confirm_form'
      )

      continueButtonElement.hostNodes().simulate('click')
      component.update()
      await flushPromises()
      expect(history.location.pathname).toContain(
        '/user/5e835e4d81fbf01e4dc554db/preview/'
      )
    })
  })

  describe('when user is in review page', () => {
    beforeEach(async () => {
      const testComponent = await createTestComponent(
        <CreateNewUser
          location={{
            pathname: REVIEW_USER_DETAILS,
            state: {},
            hash: '',
            search: ''
          }}
          // @ts-ignore
          submitForm={submitMock}
          match={{
            // @ts-ignore
            params: {
              userId: '5e835e4d81fbf01e4dc554db',
              sectionId: UserSection.Preview
            },
            isExact: true,
            path: REVIEW_USER_FORM,
            url: ''
          }}
        />,
        { store, history, graphqlMocks }
      )

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      component = testComponent
      component.update()
    })

    it('loads page without crashing', async () => {
      const actionPageElement = await waitForElement(component, ActionPageLight)
      expect(actionPageElement.prop('title')).toBe('Edit details')
    })

    it('clicking on any change button takes user to form', async () => {
      const changeButtonOfType = await waitForElement(
        component,
        '#btn_change_device'
      )
      changeButtonOfType.hostNodes().first().simulate('click')
      await flushPromises()
      expect(history.location.hash).toBe('#device')
    })

    it('clicking confirm button starts submitting the form', async () => {
      const submitButton = await waitForElement(
        component,
        '#submit-edit-user-form'
      )
      submitButton.hostNodes().simulate('click')
      expect(store.getState().userForm.submitting).toBe(true)
    })
  })
})
