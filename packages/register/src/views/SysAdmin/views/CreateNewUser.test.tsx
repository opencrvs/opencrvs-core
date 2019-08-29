import * as React from 'react'
import { createTestComponent, flushPromises } from '@register/tests/util'
import { CreateNewUser } from '@register/views/SysAdmin/views/CreateNewUser'
import { createStore } from '@register/store'
import { ReactWrapper } from 'enzyme'
import { FormFieldGenerator } from '@register/components/form'
import { modifyUserFormData } from '@register/views/SysAdmin/forms/userReducer'
import {
  mockIncompleteFormData,
  mockCompleteFormData,
  mockUserGraphqlOperation,
  mockFetchRoleGraphqlOperation,
  mockDataWithRegistarRoleSelected
} from '@register/views/SysAdmin/user/utils'
import { userSection } from '@register/views/SysAdmin/forms/fieldDefinitions/user-section'

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
      ).toBe('Required for registration')
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
