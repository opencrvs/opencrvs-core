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
import { ReactWrapper } from 'enzyme'
import { UserAuditActionModal } from './UserAuditActionModal'
import { createTestStore, createTestComponent } from '@client/tests/util'
import { AppStore } from '@client/store'
import { waitForElement } from '@client/tests/wait-for-element'

const users = [
  {
    id: '5d08e102542c7a19fc55b790',
    name: [
      {
        use: 'en',
        firstNames: 'Rabindranath',
        familyName: 'Tagore'
      }
    ],
    username: 'r.tagore',
    role: 'REGISTRATION_AGENT',
    localRegistrar: {
      name: [
        {
          use: 'en',
          firstNames: 'Nasreen Pervin',
          familyName: 'Huq'
        }
      ],
      role: 'LOCAL_REGISTRAR'
    },
    type: 'ENTREPENEUR',
    status: 'active'
  },
  {
    id: '5d08e102542c7a19fc55b793',
    name: [
      {
        use: 'en',
        firstNames: 'Nasreen Pervin',
        familyName: 'Huq'
      }
    ],
    username: 'np.huq',
    role: 'STATE_REGISTRAR',
    type: 'MAYOR',
    status: 'deactivated',
    localRegistrar: {
      name: [
        {
          use: 'en',
          firstNames: 'Kazi Nazrul',
          familyName: 'Islam'
        }
      ],
      role: 'LOCAL_REGISTRAR'
    }
  }
]

describe('user audit action modal tests', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  beforeAll(async () => {
    const testStore = await createTestStore()
    store = testStore.store
  })

  describe('in case of deactivate audit action', () => {
    let onCloseMock: jest.Mock
    let onConfirmMock: jest.Mock

    beforeAll(() => {
      onCloseMock = jest.fn()
      onConfirmMock = jest.fn()
    })

    afterEach(() => {
      onConfirmMock.mockClear()
    })

    beforeEach(async () => {
      const testComponent = await createTestComponent(
        <UserAuditActionModal
          show={true}
          user={users[0]}
          onClose={onCloseMock}
          onConfirm={onConfirmMock}
        />,
        store
      )
      component = testComponent.component
    })

    it('renders responsive modal', async () => {
      const responsiveModal = await waitForElement(
        component,
        '#user-audit-modal'
      )
    })

    it('renders title for deactivation', async () => {
      const title = await waitForElement(component, '#user-audit-modal h1')
      expect(title.text()).toBe('Deactivate Rabindranath Tagore?')
    })

    it('renders subtitle for deactivation', async () => {
      const subtitle = await waitForElement(component, '#modal-subtitle')
      expect(subtitle.hostNodes().text()).toBe(
        'This will revoke Rabindranath Tagore’s ability to login and access the system. The account can be reactivated at a later date.'
      )
    })

    it('clicking on confirm action with empty form shows error text', async () => {
      const confirmButton = await waitForElement(
        component,
        '#deactivate-action'
      )
      confirmButton.hostNodes().simulate('click')
      const formErrorText = await waitForElement(component, '#form-error')
    })

    describe('after filling mandatory data', () => {
      beforeEach(async () => {
        const terminatedRadioOption = await waitForElement(
          component,
          '#reason_TERMINATED'
        )
        terminatedRadioOption.hostNodes().simulate('change')
      })

      it('clicking confirm action triggers on confirm with payload', async () => {
        onConfirmMock.mockResolvedValueOnce(true)

        const confirmButton = await waitForElement(
          component,
          '#deactivate-action'
        )
        confirmButton.hostNodes().simulate('click')
        expect(onConfirmMock).toBeCalledWith({
          action: 'DEACTIVATE',
          comment: '',
          reason: 'TERMINATED',
          userId: '5d08e102542c7a19fc55b790'
        })
      })

      it('handle error if request throws any', async () => {
        onConfirmMock.mockRejectedValueOnce(new Error('Boom'))

        const confirmButton = await waitForElement(
          component,
          '#deactivate-action'
        )
        confirmButton.hostNodes().simulate('click')
      })
    })
  })
})
