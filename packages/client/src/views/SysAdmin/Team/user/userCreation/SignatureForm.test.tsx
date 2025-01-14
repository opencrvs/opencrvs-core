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
  mockUserGraphqlOperation,
  setScopes
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { modifyUserFormData } from '@client/user/userReducer'
import { CreateNewUser } from '@client/views/SysAdmin/Team/user/userCreation/CreateNewUser'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { roleQueries } from '@client/forms/user/query/queries'
import { Mock, describe, expect } from 'vitest'
import { SCOPES } from '@opencrvs/commons/client'
import { formatUrl } from '@client/navigation'
import { CREATE_USER_SECTION } from '@client/navigation/routes'
import { createMemoryRouter } from 'react-router-dom'

describe('signature upload tests', () => {
  const { store } = createStore()
  let testComponent: ReactWrapper
  let router: ReturnType<typeof createMemoryRouter>

  beforeEach(async () => {
    ;(roleQueries.fetchRoles as Mock).mockReturnValue(mockRoles)
    setScopes([SCOPES.USER_CREATE], store)
    store.dispatch(offlineDataReady(mockOfflineDataDispatch))
    await flushPromises()
  })

  describe('when user is in signature upload form page', () => {
    beforeEach(async () => {
      ;(roleQueries.fetchRoles as Mock).mockReturnValue(mockRoles)
      ;({ component: testComponent, router } = await createTestComponent(
        <CreateNewUser />,
        {
          store,
          path: CREATE_USER_SECTION,
          initialEntries: [
            formatUrl(CREATE_USER_SECTION, {
              sectionId: mockOfflineData.userForms.sections[0].id,
              groupId: mockOfflineData.userForms.sections[0].groups[2].id
            })
          ]
        }
      ))
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
        .find('input[name="signature"][type="file"]')
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
        .find('input[name="signature"][type="file"]')
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

      expect(router.state.location.pathname).toContain(
        '/createUser/preview/preview-registration-office'
      )
    })
  })

  describe('when user in review page', () => {
    beforeEach(async () => {
      await flushPromises()
      store.dispatch(modifyUserFormData(mockDataWithRegistarRoleSelected))
      ;({ component: testComponent } = await createTestComponent(
        <CreateNewUser />,
        {
          store,
          path: CREATE_USER_SECTION,
          initialEntries: [
            formatUrl(CREATE_USER_SECTION, {
              sectionId: mockOfflineData.userForms.sections[1].id,
              groupId: mockOfflineData.userForms.sections[1].groups[0].id
            })
          ],
          graphqlMocks: [
            mockFetchRoleGraphqlOperation,
            mockUserGraphqlOperation
          ]
        }
      ))
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
