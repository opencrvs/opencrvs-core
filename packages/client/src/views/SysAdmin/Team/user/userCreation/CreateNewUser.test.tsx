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
  mockRoles,
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
import { ISelectFormFieldWithOptions, UserSection } from '@client/forms'
import { waitForElement } from '@client/tests/wait-for-element'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { History } from 'history'
import { vi, Mock, describe, expect } from 'vitest'
import { GetUserQuery, Status } from '@client/utils/gateway'

const mockUsers = {
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
          role: {
            id: 'NATIONAL_REGISTRAR',
            label: {
              defaultMessage: 'National Registrar',
              description: 'Name for user role National Regisrtar',
              id: 'userRole.nationalRegistrar'
            }
          },
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
          role: {
            id: 'LOCAL_SYSTEM_ADMIN',
            label: {
              defaultMessage: 'Local System Admin',
              description: 'Name for user role Local System Admin',
              id: 'userRole.localSystemAdmin'
            }
          },
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
          role: {
            id: 'NATIONAL_REGISTRAR',
            label: {
              defaultMessage: 'National Registrar',
              description: 'Name for user role National Registrar',
              id: 'userRole.nationalRegistrar'
            }
          },
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
          role: {
            id: 'STATE_REGISTRAR',
            label: {
              defaultMessage: 'State Registrar',
              description: 'Name for user role State Registrar',
              id: 'userRole.stateRegistrar'
            }
          },
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
          role: {
            id: 'DISTRICT_REGISTRAR',
            label: {
              defaultMessage: 'District Registrar',
              description: 'Name for user role District Registrar',
              id: 'userRole.districtRegistrar'
            }
          },
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
          role: {
            id: 'LOCAL_REGISTRAR',
            label: {
              defaultMessage: 'Local Registrar',
              description: 'Name for user role Local Registrar',
              id: 'userRole.localRegistrar'
            }
          },
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
          role: {
            id: 'REGISTRATION_AGENT',
            label: {
              defaultMessage: 'Registration Agent',
              description: 'Name for user role Registration Agent',
              id: 'userRole.registrationAgent'
            }
          },
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
          role: {
            id: 'FIELD_AGENT',
            label: {
              defaultMessage: 'Field Agent',
              description: 'Name for user role Field Agent',
              id: 'userRole.fieldAgent'
            }
          },
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
    store.dispatch(offlineDataReady(mockOfflineDataDispatch))
    await flushPromises()
  })

  describe('when user is in create new user form', () => {
    beforeEach(async () => {
      testComponent = await createTestComponent(
        <CreateNewUser
          match={{
            // @ts-ignore
            params: {
              locationId: '0d8474da-0361-4d32-979e-af91f012340a',
              sectionId: mockOfflineData.userForms.sections[0].id
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
          .find('#familyName_error')
          .hostNodes()
          .text()
      ).toBe('Required to register a new user')
    })

    it('clicking on confirm button with complete data takes user to signature attachment page', async () => {
      store.dispatch(modifyUserFormData(mockCompleteFormData))
      await waitForElement(testComponent, '#confirm_form')
      testComponent.find('#confirm_form').hostNodes().simulate('click')
      await flushPromises()
      expect(history.location.pathname).toContain(
        'preview/preview-registration-office'
      )
    })

    it('clicking on confirm by selecting registrar as role will go to signature form page', async () => {
      store.dispatch(modifyUserFormData(mockDataWithRegistarRoleSelected))
      await waitForElement(testComponent, '#confirm_form')
      testComponent.find('#confirm_form').hostNodes().simulate('click')
      await flushPromises()

      // this will have to be updated after signature page is updated for new user roles structure
      expect(history.location.pathname).toContain(
        '/createUser/preview/preview-registration-office'
      )
    })
  })

  describe('when user in review page', () => {
    beforeEach(async () => {
      store.dispatch(offlineDataReady(mockOfflineDataDispatch))
      await flushPromises()
      store.dispatch(modifyUserFormData(mockCompleteFormData))
      testComponent = await createTestComponent(
        // @ts-ignore
        <CreateNewUser
          match={{
            params: {
              sectionId: mockOfflineData.userForms.sections[1].id,
              groupId: mockOfflineData.userForms.sections[1].groups[0].id
            },
            isExact: true,
            path: '/createUser',
            url: ''
          }}
        />,
        { store, history }
      )
      // Wait until roles are loaded
      await waitForElement(testComponent, '#content-name')
    })

    it('renders review header', () => {
      expect(testComponent.find('#content-name').hostNodes().text()).toBe(
        'Please review the new users details'
      )
    })

    it('clicking change button on a field takes user back to form', async () => {
      testComponent
        .find('#btn_change_firstName')
        .hostNodes()
        .first()
        .simulate('click')
      await flushPromises()
      expect(history.location.pathname).toBe('/createUser/user/user-view-group')
      expect(history.location.hash).toBe('#firstName')
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
            email: 'jeff@gmail.com',
            role: {
              id: 'NATIONAL_REGISTRAR',
              label: {
                id: 'userRoles.nationalRegistrar',
                defaultMessage: 'National Registrar',
                description: ''
              }
            },
            status: Status.Active,
            underInvestigation: false,
            practitionerId: '94429795-0a09-4de8-8e1e-27dab01877d2',
            primaryOffice: {
              id: '895cc945-94a9-4195-9a29-22e9310f3385',
              name: 'Narsingdi Paurasabha',
              alias: ['নরসিংদী পৌরসভা'],
              __typename: 'Location'
            },
            // without signature confirm button stays disabled
            signature: new File(['(⌐□_□)'], 'chucknorris.png', {
              type: 'image/png'
            }),
            creationDate: '2019-03-31T18:00:00.000Z',
            __typename: 'User'
          } satisfies GetUserQuery['getUser']
        }
      }
    }
  ]

  beforeEach(async () => {
    ;(roleQueries.fetchRoles as Mock).mockReturnValue(mockRoles)
    ;(userQueries.searchUsers as Mock).mockReturnValue(mockUsers)
    store.dispatch(offlineDataReady(mockOfflineDataDispatch))
    await flushPromises()
  })

  it('check user role update', async () => {
    const section = store
      .getState()
      .userForm.userForm?.sections.find((section) => section.id === 'user')
    const group = section!.groups.find(
      (group) => group.id === 'user-view-group'
    )!
    const field = group.fields.find(
      (field) => field.name === 'role'
    ) as ISelectFormFieldWithOptions
    expect(field.options).not.toEqual([])
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

    it('clicking on continue button takes user signature attachment page', async () => {
      const continueButtonElement = await waitForElement(
        component,
        '#confirm_form'
      )

      continueButtonElement.hostNodes().simulate('click')
      component.update()
      await flushPromises()

      // this will have to be updated after signature page is updated for new user roles structure
      expect(history.location.pathname).toContain(
        '/user/5e835e4d81fbf01e4dc554db/preview/preview-registration-office'
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

    it.only('clicking confirm button starts submitting the form', async () => {
      await waitForElement(component, '#submit-edit-user-form')
      component.update()

      const submitButton = await waitForElement(
        component,
        '#submit-edit-user-form'
      )
      submitButton.hostNodes().simulate('click')
      expect(store.getState().userForm.submitting).toBe(true)
    })
  })
})
