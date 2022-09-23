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
import {
  createTestComponent,
  userDetails,
  flushPromises,
  getFileFromBase64String,
  validImageB64String
} from '@client/tests/util'
import { createStore } from '@client/store'
import { SettingsPage } from '@client/views/Settings/SettingsPage'
import { getStorageUserDetailsSuccess } from '@opencrvs/client/src/profile/profileActions'
import { DataSection } from '@opencrvs/components/lib/interface'
import { ReactWrapper } from 'enzyme'
import { COUNT_USER_WISE_DECLARATIONS } from '@client/search/queries'
import { changeAvatarMutation, AvatarChangeModal } from './AvatarChangeModal'
import * as imageUtils from '@client/utils/imageUtils'

const graphqlMocks = [
  {
    request: {
      query: COUNT_USER_WISE_DECLARATIONS,
      variables: {
        status: ['REJECTED'],
        locationIds: ['6327dbd9-e118-4dbe-9246-cb0f7649a666']
      }
    },
    result: {
      data: {
        searchEvents: {
          totalItems: 1
        }
      }
    }
  },
  {
    request: {
      query: changeAvatarMutation,
      variables: {
        userId: '123',
        avatar: {
          type: 'image/jpeg',
          data: validImageB64String
        }
      }
    },
    result: {
      data: []
    }
  }
]

describe('Settings page tests', () => {
  const { store, history } = createStore()
  let component: ReactWrapper
  beforeEach(async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))

    const testComponent = await createTestComponent(
      // @ts-ignore
      <SettingsPage />,
      { store, history, graphqlMocks }
    )
    component = testComponent
  })

  it('it checks component has loaded', () => {
    // @ts-ignore
    expect(component.containsMatchingElement(DataSection)).toBe(true)
  })
  it('it checks modal is open when button clicked', () => {
    component.find('#BtnChangeLanguage').hostNodes().first().simulate('click')

    expect(
      component.find('#ChangeLanguageModal').hostNodes().first()
    ).toHaveLength(1)
  })
  it('it checks cancel button clicked', () => {
    component.find('#BtnChangeLanguage').hostNodes().first().simulate('click')

    const modal = component.find('#ChangeLanguageModal').hostNodes()

    modal.find('#modal_cancel').hostNodes().simulate('click')
  })
  it('it checks cancel button clicked', () => {
    component.find('#BtnChangeLanguage').hostNodes().first().simulate('click')

    const modal = component.find('#ChangeLanguageModal').hostNodes()

    modal.find('#apply_change').hostNodes().simulate('click')
  })

  describe('When user changes password', () => {
    beforeEach(() => {
      component.find('#BtnChangePassword').hostNodes().first().simulate('click')
    })

    it('Should display password change modal', () => {
      const modal = component.find('#ChangePasswordModal').hostNodes()
      expect(modal.length).toEqual(1)

      modal.find('#confirm-button').hostNodes().simulate('click')
    })

    it('Should display match message for valid password', () => {
      component
        .find('#CurrentPassword')
        .hostNodes()
        .simulate('change', {
          target: { id: 'CurrentPassword', value: 'SomePass123' }
        })

      component
        .find('#NewPassword')
        .hostNodes()
        .simulate('change', {
          target: { id: 'NewPassword', value: 'SomePass123' }
        })

      component
        .find('#ConfirmPassword')
        .hostNodes()
        .simulate('change', {
          target: { id: 'ConfirmPassword', value: 'SomePass123' }
        })

      component.update()

      const validationMsgExist = Boolean(
        component.find('#passwordMatch').hostNodes().length
      )
      expect(validationMsgExist).toBe(true)
    })

    it('Should hide the password modal', () => {
      component.find('#close-btn').hostNodes().simulate('click')
      component.update()

      const modalIsClosed = !Boolean(
        component.find('#ChangePasswordModal').hostNodes().length
      )
      expect(modalIsClosed).toBe(true)
    })
  })

  describe('When user changes profile image', () => {
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })

    it('should display apply change modal', async () => {
      component
        .find('#image_file_uploader_field')
        .hostNodes()
        .first()
        .simulate('change', { target: { files: [file] } })

      component.update()
      expect(component.find('#ChangeAvatarModal').hostNodes()).toHaveLength(1)
    })

    it('should show error for invalid image', async () => {
      const invalidFile = new File(['(⌐□_□)'], 'chucknorris.png', {
        type: 'image/svg+xml'
      })
      component
        .find('#image_file_uploader_field')
        .hostNodes()
        .first()
        .simulate('change', { target: { files: [invalidFile] } })

      await flushPromises()
      component.update()
      expect(component.find(AvatarChangeModal).prop('error')).toContain(
        'Image format not supported'
      )
    })

    it('should change profile image', async () => {
      jest
        .spyOn(imageUtils, 'getCroppedImage')
        .mockImplementation((img, crop) =>
          Promise.resolve({
            type: 'image/jpeg',
            data: validImageB64String
          })
        )
      component
        .find('#image_file_uploader_field')
        .hostNodes()
        .first()
        .simulate('change', {
          target: {
            files: [
              getFileFromBase64String(
                validImageB64String,
                'img.png',
                'image/png'
              )
            ]
          }
        })

      await flushPromises()

      component.update()

      component
        .find(AvatarChangeModal)
        .find('#apply_change')
        .hostNodes()
        .simulate('click')

      await flushPromises()

      component.update()

      expect(component.find('#ChangeAvatarModal').hostNodes()).toHaveLength(0)
    })

    it('Should close change avater modal', () => {
      component
        .find('#image_file_uploader_field')
        .hostNodes()
        .first()
        .simulate('change', {
          target: {
            files: [file]
          }
        })

      component.update()
      component.find('#close-btn').hostNodes().simulate('click')
      component.update()

      expect(component.find('#ChangeAvatarModal').hostNodes()).toHaveLength(0)
    })
  })
})
