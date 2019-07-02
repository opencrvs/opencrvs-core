import * as React from 'react'
import { createTestComponent, flushPromises, wait } from '@register/tests/util'
import { CreateNewUser } from '@register/views/SysAdmin/views/CreateNewUser'
import { createStore } from '@register/store'
import { ReactWrapper } from 'enzyme'
import { FormFieldGenerator } from '@register/components/form'
import { modifyUserFormData } from '@register/views/SysAdmin/forms/userReducer'
import {
  mockIncompleteFormData,
  mockCompleteFormData,
  mockUserGraphqlOperation,
  mockFetchRoleGraphqlOperation
} from '@register/views/SysAdmin/user/utils'

describe('create new user tests', () => {
  const { store, history } = createStore()
  let testComponent: ReactWrapper

  describe('when user is in create new user form', () => {
    beforeEach(() => {
      testComponent = createTestComponent(
        // @ts-ignore
        <CreateNewUser
          match={{
            params: {
              sectionId: 'user'
            },
            isExact: true,
            path: '/createUser',
            url: ''
          }}
        />,
        store,
        [mockFetchRoleGraphqlOperation]
      ).component
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
      ).toBe('This field must be completed.')
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
  })

  describe('when user in review page', () => {
    beforeEach(() => {
      store.dispatch(modifyUserFormData(mockCompleteFormData))
      testComponent = createTestComponent(
        // @ts-ignore
        <CreateNewUser
          match={{
            params: {
              sectionId: 'preview'
            },
            isExact: true,
            path: '/createUser',
            url: ''
          }}
        />,
        store,
        [mockFetchRoleGraphqlOperation, mockUserGraphqlOperation]
      ).component
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
      expect(history.location.pathname).toBe('/createUser/user')
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
