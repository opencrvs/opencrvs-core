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
import { createTestComponent, flushPromises } from '@client/tests/util'
import { CreateNewUser } from '@client/views/SysAdmin/tabs/user/userCreation/CreateNewUser'
import { createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import { FormFieldGenerator } from '@client/components/form'
import { modifyUserFormData, processRoles } from '@client/user/userReducer'
import {
  mockIncompleteFormData,
  mockCompleteFormData,
  mockUserGraphqlOperation,
  mockFetchRoleGraphqlOperation,
  mockDataWithRegistarRoleSelected
} from '@client/views/SysAdmin/utils'
import { userSection } from '@client/forms/user/fieldDefinitions/user-section'
import { roleQueries } from '@client/forms/user/fieldDefinitions/query/queries'
import { userQueries } from '@client/sysadmin/user/queries'
import { queries } from '@client/profile/queries'
export const mockRoles = {
  data: {
    getRoles: [
      { value: 'FIELD_AGENT', types: ['HOSPITAL', 'CHA'], __typename: 'Role' },
      {
        value: 'REGISTRATION_AGENT',
        types: ['ENTREPENEUR', 'DATA_ENTRY_CLERK'],
        __typename: 'Role'
      },
      {
        value: 'LOCAL_REGISTRAR',
        types: ['SECRETARY', 'CHAIRMAN', 'MAYOR'],
        __typename: 'Role'
      },
      {
        value: 'LOCAL_SYSTEM_ADMIN',
        types: ['LOCAL_SYSTEM_ADMIN'],
        __typename: 'Role'
      },
      {
        value: 'NATIONAL_SYSTEM_ADMIN',
        types: ['NATIONAL_SYSTEM_ADMIN'],
        __typename: 'Role'
      },
      {
        value: 'PERFORMANCE_OVERSIGHT',
        types: ['CABINET_DIVISION', 'BBS'],
        __typename: 'Role'
      },
      {
        value: 'PERFORMANCE_MANAGEMENT',
        types: ['HEALTH_DIVISION', 'ORG_DIVISION'],
        __typename: 'Role'
      },
      { value: 'API_USER', types: ['API_USER'], __typename: 'Role' }
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
          role: 'API_USER',
          type: 'API_USER',
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
          role: 'LOCAL_SYSTEM_ADMIN',
          type: 'LOCAL_SYSTEM_ADMIN',
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
          role: 'NATIONAL_REGISTRAR',
          type: 'SECRETARY',
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
          role: 'STATE_REGISTRAR',
          type: 'MAYOR',
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
          role: 'DISTRICT_REGISTRAR',
          type: 'MAYOR',
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
          role: 'LOCAL_REGISTRAR',
          type: 'CHAIRMAN',
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
          role: 'REGISTRATION_AGENT',
          type: 'ENTREPENEUR',
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
          role: 'FIELD_AGENT',
          type: 'CHA',
          status: 'active',
          __typename: 'User'
        }
      ],
      __typename: 'SearchUserResult'
    }
  }
}
;(roleQueries.fetchRoles as jest.Mock).mockReturnValue(mockRoles)
;(userQueries.searchUsers as jest.Mock).mockReturnValue(mockUsers)

describe('create new user tests', () => {
  const { store, history } = createStore()
  let testComponent: ReactWrapper

  describe('when user is in create new user form', () => {
    beforeEach(async () => {
      testComponent = (await createTestComponent(
        // @ts-ignore
        <CreateNewUser
          match={{
            params: {
              sectionId: 'user',
              groupId: userSection.groups[0].id
            },
            isExact: true,
            path: '/createUser',
            url: ''
          }}
        />,
        store,
        [mockFetchRoleGraphqlOperation]
      )).component
    })

    it('clicking on confirm button with unfilled required fields shows validation errors', async () => {
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.update()
      store.dispatch(modifyUserFormData(mockIncompleteFormData))

      testComponent
        .find('#confirm_form')
        .hostNodes()
        .simulate('click')

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
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.update()

      store.dispatch(modifyUserFormData(mockCompleteFormData))

      testComponent
        .find('#confirm_form')
        .hostNodes()
        .simulate('click')
      await flushPromises()

      expect(history.location.pathname).toContain('preview')
    })

    it('clicking on confirm by selecting registrar as role will go to signature form page', async () => {
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.update()

      store.dispatch(modifyUserFormData(mockDataWithRegistarRoleSelected))

      testComponent
        .find('#confirm_form')
        .hostNodes()
        .simulate('click')
      await flushPromises()

      expect(history.location.pathname).toContain(
        '/createUser/user/signature-attachment'
      )
    })
  })

  describe('when user in review page', () => {
    beforeEach(async () => {
      store.dispatch(modifyUserFormData(mockCompleteFormData))
      testComponent = (await createTestComponent(
        // @ts-ignore
        <CreateNewUser
          match={{
            params: {
              sectionId: 'preview',
              groupId: 'preview-' + userSection.groups[0].id
            },
            isExact: true,
            path: '/createUser',
            url: ''
          }}
        />,
        store,
        [mockFetchRoleGraphqlOperation, mockUserGraphqlOperation]
      )).component
    })

    it('renders review header', () => {
      expect(
        testComponent
          .find('#preview_title')
          .hostNodes()
          .text()
      ).toBe('Please review the new users details')
    })

    it('clicking change button on a field takes user back to form', async () => {
      testComponent
        .find('#btn_change_familyNameEng')
        .hostNodes()
        .simulate('click')
      await flushPromises()
      expect(history.location.pathname).toBe('/createUser/user/user-view-group')
      expect(history.location.hash).toBe('#familyNameEng')
    })

    it('clicking submit button submits the form data', async () => {
      testComponent
        .find('#submit_user_form')
        .hostNodes()
        .simulate('click')

      await flushPromises()

      expect(store.getState().userForm.submitting).toBe(false)
    })
  })
})
