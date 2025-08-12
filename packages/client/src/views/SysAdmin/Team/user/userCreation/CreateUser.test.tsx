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
import { formatUrl } from '@client/navigation'
import {
  CREATE_USER_ON_LOCATION,
  CREATE_USER_SECTION
} from '@client/navigation/routes'
import { offlineDataReady } from '@client/offline/actions'
import { AppStore, createStore } from '@client/store'
import {
  createTestComponent,
  flushPromises,
  loginAsFieldAgent,
  mockCompleteFormData,
  mockDataWithRegistarRoleSelected,
  mockOfflineData,
  mockOfflineDataDispatch,
  mockRoles,
  setScopes,
  TestComponentWithRouteMock
} from '@client/tests/util'
import { waitFor, waitForElement } from '@client/tests/wait-for-element'
import { modifyUserFormData } from '@client/user/userReducer'
import { CreateUser } from '@client/views/SysAdmin/Team/user/userCreation/CreateUser'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { Mock, describe, expect } from 'vitest'
import { SCOPES } from '@opencrvs/commons/client'

describe('create new user tests', () => {
  let store: AppStore
  let testComponent: ReactWrapper
  let testRouter: TestComponentWithRouteMock['router']

  beforeEach(async () => {
    const s = createStore()
    store = s.store

    setScopes([SCOPES.USER_CREATE], store)
    ;(roleQueries.fetchRoles as Mock).mockReturnValue(mockRoles)
    store.dispatch(offlineDataReady(mockOfflineDataDispatch))
    await flushPromises()
  })

  describe('when user is in create new user form', () => {
    beforeEach(async () => {
      const component = await createTestComponent(<CreateUser />, {
        store,
        path: CREATE_USER_ON_LOCATION,
        initialEntries: [
          formatUrl(CREATE_USER_ON_LOCATION, {
            locationId: '0d8474da-0361-4d32-979e-af91f012340a',
            sectionId: mockOfflineData.userForms.sections[0].id
          })
        ]
      })

      testComponent = component.component
      testRouter = component.router

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

    it('clicking on confirm button with complete data takes user to review page', async () => {
      store.dispatch(modifyUserFormData(mockCompleteFormData))
      await waitForElement(testComponent, '#confirm_form')
      testComponent.find('#confirm_form').hostNodes().simulate('click')
      await flushPromises()
      expect(testRouter.state.location.pathname).toContain(
        'preview/preview-registration-office'
      )
    })

    it('clicking on confirm by selecting registrar as role will go to signature form page', async () => {
      store.dispatch(modifyUserFormData(mockDataWithRegistarRoleSelected))
      await waitForElement(testComponent, '#confirm_form')
      testComponent.find('#confirm_form').hostNodes().simulate('click')
      await flushPromises()

      expect(testRouter.state.location.pathname).toContain(
        '/createUser/user/signature-attachment'
      )
    })
  })

  describe('when user in review page', () => {
    beforeEach(async () => {
      await flushPromises()

      store.dispatch(offlineDataReady(mockOfflineDataDispatch))
      store.dispatch(modifyUserFormData(mockCompleteFormData))

      await flushPromises()
      ;({ component: testComponent, router: testRouter } =
        await createTestComponent(<CreateUser />, {
          store,
          path: CREATE_USER_SECTION,
          initialEntries: [
            formatUrl(CREATE_USER_SECTION, {
              sectionId: mockOfflineData.userForms.sections[1].id,
              groupId: mockOfflineData.userForms.sections[1].groups[0].id
            })
          ]
        }))

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
      expect(testRouter.state.location.pathname).toBe(
        '/createUser/user/user-view-group'
      )
      expect(testRouter.state.location.hash).toBe('#firstName')
    })

    it('clicking submit button submits the form data', async () => {
      testComponent.find('#submit_user_form').hostNodes().simulate('click')

      await waitFor(() => store.getState().userForm.submitting === false)
    })
  })
})
