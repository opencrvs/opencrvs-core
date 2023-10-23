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
import { offlineDataReady } from '@client/offline/actions'
import { createStore } from '@client/store'
import {
  createTestComponent,
  flushPromises,
  getFileFromBase64String,
  mockOfflineData,
  validImageB64String,
  mockOfflineDataDispatch,
  mockFetchRoleGraphqlOperation,
  mockDataWithRegistarRoleSelected,
  mockRoles,
  mockUserGraphqlOperation
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import {
  modifyUserFormData,
  rolesMessageAddData
} from '@client/user/userReducer'
import { CreateNewUser } from '@client/views/SysAdmin/Team/user/userCreation/CreateNewUser'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { roleQueries } from '@client/forms/user/query/queries'
import { Mock, describe, expect } from 'vitest'

describe('signature upload tests', () => {
  const { store, history } = createStore()
  let testComponent: ReactWrapper

  beforeEach(async () => {
    ;(roleQueries.fetchRoles as Mock).mockReturnValue(mockRoles)
    await store.dispatch(offlineDataReady(mockOfflineDataDispatch))
  })

  describe('when user is in signature upload form page', () => {
    beforeEach(async () => {
      ;(roleQueries.fetchRoles as Mock).mockReturnValue(mockRoles)
      testComponent = await createTestComponent(
        // @ts-ignore
        <CreateNewUser
          match={{
            params: {
              sectionId: mockOfflineData.userForms.sections[0].id,
              groupId: mockOfflineData.userForms.sections[0].groups[2].id
            },
            isExact: true,
            path: '/createUser',
            url: ''
          }}
        />,
        { store, history }
      )
    })

    it('show the signature form page', async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.update()

      const title = testComponent.find('#content-name').hostNodes().text()

      expect(title).toBe('Attach the signature')
    })

    it('return if not file', async () => {
      await new Promise((resolve) => {
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

    it('No error while uploading if valid file', async () => {
      await new Promise((resolve) => {
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

    it('clicking on confirm button will go to review page', async () => {
      store.dispatch(modifyUserFormData(mockDataWithRegistarRoleSelected))
      const confirmButton = await waitForElement(testComponent, '#confirm_form')
      confirmButton.hostNodes().simulate('click')
      await flushPromises()
      testComponent.update()

      expect(history.location.pathname).toContain(
        '/createUser/preview/preview-registration-office'
      )
    })
  })

  describe('when user in review page', () => {
    beforeEach(async () => {
      store.dispatch(modifyUserFormData(mockDataWithRegistarRoleSelected))
      store.dispatch(rolesMessageAddData())
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
        {
          store,
          history,
          graphqlMocks: [
            mockFetchRoleGraphqlOperation,
            mockUserGraphqlOperation
          ]
        }
      )
    })

    it('renders review header', () => {
      testComponent.update()
      expect(testComponent.find('#content-name').hostNodes().text()).toBe(
        'Please review the new users details'
      )
    })

    it('clicking submit button submits the form data', async () => {
      testComponent.update()
      testComponent.find('#submit_user_form').hostNodes().simulate('click')

      expect(store.getState().userForm.submitting).toBe(true)
    })
  })
})
