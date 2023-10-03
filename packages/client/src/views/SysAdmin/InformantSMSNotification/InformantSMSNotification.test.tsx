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
import * as React from 'react'
import {
  createTestComponent,
  createRouterProps,
  flushPromises,
  userDetails
} from '@client/tests/util'
import InformantNotification from '@client/views/SysAdmin/InformantSMSNotification/InformantSMSNotification'
import { AppStore, createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import { formatUrl } from '@client/navigation'
import { INFORMANT_NOTIFICATION } from '@client/navigation/routes'
import { GET_INFORMANT_SMS_NOTIFICATIONS } from '@client/views/SysAdmin/InformantSMSNotification/queries'
import { TOGGLE_INFORMANT_SMS_NOTIFICATION_MUTATION } from '@client/views/SysAdmin/InformantSMSNotification/mutations'
import { History } from 'history'
import { informantSMSNotificationMock } from '@client/tests/mock-graphql-responses'
import { getStorageUserDetailsSuccess } from '@client/profile/profileActions'
import { waitForElement } from '@client/tests/wait-for-element'

const graphqlMock = [
  {
    request: {
      operationName: null,
      query: GET_INFORMANT_SMS_NOTIFICATIONS
    },
    result: {
      data: {
        informantSMSNotifications: informantSMSNotificationMock
      }
    }
  },
  {
    request: {
      query: TOGGLE_INFORMANT_SMS_NOTIFICATION_MUTATION,
      variables: {
        smsNotifications: [
          {
            id: '63a30240ee4b270dc91f53d7',
            name: 'deathRejectionSMS',
            enabled: true
          }
        ]
      }
    },
    result: {
      data: {
        toggleInformantSMSNotification: informantSMSNotificationMock
      }
    }
  }
]

describe('InformantNotification test', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History

  beforeEach(async () => {
    const s = createStore()
    store = s.store
    history = s.history
    component = await createTestComponent(
      // @ts-ignore
      <InformantNotification
        {...createRouterProps(formatUrl(INFORMANT_NOTIFICATION, {}), {
          isNavigatedInsideApp: false
        })}
      />,
      {
        store,
        history,
        graphqlMocks: graphqlMock as any
      }
    )

    await flushPromises()
    component.update()
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
    await flushPromises()
    component.update()
  })

  it('InformantNotification page loads properly', async () => {
    expect(component.exists('InformantNotification')).toBeTruthy()
  })

  it('show informant sms notifications for birth by default', async () => {
    expect(component.find('#tab_birth').hostNodes()).toHaveLength(1)
    expect(
      component.find('#birthInProgressSMS_label').hostNodes().first().text()
    ).toBe('Notification sent to Office')
    expect(
      component.find('#birthDeclarationSMS_label').hostNodes().first().text()
    ).toBe('Declaration sent for review')
    expect(
      component.find('#birthRegistrationSMS_label').hostNodes().first().text()
    ).toBe('Declaration registered')
    expect(
      component.find('#birthRejectionSMS_label').hostNodes().first().text()
    ).toBe('Declaration rejected')
  })

  it('show informant sms notifications for death', async () => {
    expect(component.find('#tab_death').hostNodes()).toHaveLength(1)
    component.find('#tab_death').hostNodes().simulate('click')
    component.update()
    expect(
      component.find('#deathInProgressSMS_label').hostNodes().first().text()
    ).toBe('Notification sent to Office')
    expect(
      component.find('#deathDeclarationSMS_label').hostNodes().first().text()
    ).toBe('Declaration sent for review')
    expect(
      component.find('#deathRegistrationSMS_label').hostNodes().first().text()
    ).toBe('Declaration registered')
    expect(
      component.find('#deathRejectionSMS_label').hostNodes().first().text()
    ).toBe('Declaration rejected')
  })

  it('Save button will be disable for the first time', async () => {
    await waitForElement(component, '#save')
    expect(component.find('#save').hostNodes().props().disabled).toBeTruthy()
  })

  it('Save button will be enabled if toggle any input', async () => {
    component
      .find('#birthInProgressSMS')
      .hostNodes()
      .first()
      .simulate('change', { target: { checked: false } })

    expect(component.find('#save').hostNodes().props().disabled).toBeFalsy()
  })

  it('will show notification after save the change', async () => {
    component
      .find('#birthInProgressSMS')
      .hostNodes()
      .first()
      .simulate('change', { target: { checked: false } })

    component.find('#save').hostNodes().simulate('click')
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    await flushPromises()
    component.update()
    expect(component.find('#informant_notification').hostNodes()).toHaveLength(
      1
    )
  })
})
