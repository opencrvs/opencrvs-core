import * as React from 'react'
import {
  createTestComponent,
  flushPromises,
  getFileFromBase64String,
  validImageB64String
} from '@register/tests/util'
import { CreateNewUser } from '@register/views/SysAdmin/views/CreateNewUser'
import { createStore } from '@register/store'
import { ReactWrapper } from 'enzyme'
import { modifyUserFormData } from '@register/views/SysAdmin/forms/userReducer'
import {
  mockFetchRoleGraphqlOperation,
  mockDataWithRegistarRoleSelected,
  mockUserGraphqlOperation
} from '@register/views/SysAdmin/user/utils'
import { userSection } from '@register/views/SysAdmin/forms/fieldDefinitions/user-section'
import { waitForElement } from '@register/tests/wait-for-element'

describe('signature upload tests', () => {
  const { store, history } = createStore()
  let testComponent: ReactWrapper

  describe('when user is in signature upload form page', () => {
    beforeEach(async () => {
      testComponent = (await createTestComponent(
        // @ts-ignore
        <CreateNewUser
          match={{
            params: {
              sectionId: 'user',
              groupId: userSection.groups[1].id
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

    it('show the signature form page', async () => {
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.update()

      const title = testComponent
        .find('#form-title')
        .hostNodes()
        .text()

      expect(title).toBe('Attach the registrar’s signature')
    })

    it('clicking on confirm button with unfilled required fields shows validation errors', async () => {
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.update()
      testComponent
        .find('#confirm_form')
        .hostNodes()
        .simulate('click')
      await flushPromises()
      testComponent.update()

      const error = testComponent
        .find('#field-error')
        .hostNodes()
        .text()

      expect(error).toBe('Required for registration')
    })

    it('No error while uploading if valid file', async () => {
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.update()
      testComponent
        .find('#image_file_uploader_field')
        .hostNodes()
        .simulate('change', {
          target: {
            files: [
              getFileFromBase64String(
                validImageB64String,
                'index.png',
                'image/png'
              )
            ]
          }
        })
      await flushPromises()
      testComponent.update()

      expect(testComponent.find('#field-error').hostNodes().length).toBe(0)
    })

    it('return if not file', async () => {
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.update()
      testComponent
        .find('#image_file_uploader_field')
        .hostNodes()
        .simulate('change', {
          target: {
            files: []
          }
        })
      await flushPromises()
      testComponent.update()

      expect(testComponent.find('#field-error').hostNodes().length).toBe(0)
    })

    it('clicking on confirm button will go to review page', async () => {
      store.dispatch(modifyUserFormData(mockDataWithRegistarRoleSelected))
      const confirmButton = await waitForElement(testComponent, '#confirm_form')
      confirmButton.hostNodes().simulate('click')
      await flushPromises()
      testComponent.update()

      expect(history.location.pathname).toContain(
        '/createUser/preview/preview-user-view-group'
      )
    })
  })

  describe('when user in review page', () => {
    beforeEach(async () => {
      store.dispatch(modifyUserFormData(mockDataWithRegistarRoleSelected))
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
