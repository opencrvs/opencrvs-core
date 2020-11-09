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
import { createStore } from '@client/store'
import { storeApplication, IApplication } from '@client/applications'
import {
  createTestComponent,
  mockApplicationData,
  mockUserResponse,
  mockDeathApplicationData,
  validToken,
  flushPromises
} from '@client/tests/util'
import { ReviewCertificateAction } from './ReviewCertificateAction'
import { ReactWrapper } from 'enzyme'
import { Event } from '@client/forms'
import { REGISTRAR_ROLES } from '@client/utils/constants'
import { queries } from '@client/profile/queries'
import { merge, cloneDeep } from 'lodash'
import { waitForElement } from '@client/tests/wait-for-element'
import { checkAuth } from '@client/profile/profileActions'

const nameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Sakib',
          familyName: 'Al Hasan',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      role: REGISTRAR_ROLES[0],
      practitionerId: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
    }
  }
}
merge(mockUserResponse, nameObj)

beforeEach(() => {
  ;(queries.fetchUserDetails as jest.Mock).mockReturnValue(mockUserResponse)
})

describe('when user wants to review death certificate', () => {
  const { store, history } = createStore()
  const mockLocation: any = jest.fn()

  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    await store.dispatch(checkAuth({ '?token': validToken }))

    await store.dispatch(
      storeApplication(({
        id: 'mockDeath1234',
        data: mockDeathApplicationData,
        event: Event.DEATH
      } as unknown) as IApplication)
    )
    const testComponent = await createTestComponent(
      <ReviewCertificateAction
        location={mockLocation}
        history={history}
        match={{
          params: {
            registrationId: 'mockDeath1234',
            eventType: Event.DEATH
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )
    component = testComponent.component
  })

  it('Should display have the Continue and print Button', async () => {
    const confirmBtn = await waitForElement(component, '#confirm-print')
    const confirmBtnExist = !!confirmBtn.hostNodes().length
    expect(confirmBtnExist).toBe(true)
  })
})

describe('when user wants to review birth certificate', () => {
  const { store, history } = createStore()
  const mockLocation: any = jest.fn()

  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    await store.dispatch(checkAuth({ '?token': validToken }))
    const mockBirthApplicationData = cloneDeep(mockApplicationData)
    mockBirthApplicationData.registration.certificates[0] = {
      collector: {
        type: 'PRINT_IN_ADVANCE'
      }
    }
    await store.dispatch(
      storeApplication(({
        id: 'asdhdqe2472487jsdfsdf',
        data: mockBirthApplicationData,
        event: Event.BIRTH
      } as unknown) as IApplication)
    )

    const testComponent = await createTestComponent(
      <ReviewCertificateAction
        location={mockLocation}
        history={history}
        match={{
          params: {
            registrationId: 'asdhdqe2472487jsdfsdf',
            eventType: Event.BIRTH
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    testComponent.component.update()
    component = testComponent.component
  })

  it('Should display have the Continue and print Button', () => {
    const confirmBtnExist = !!component.find('#confirm-print').hostNodes()
      .length
    expect(confirmBtnExist).toBe(true)
  })

  it('Should show the Confirm Print Modal', () => {
    const confirmBtn = component.find('#confirm-print').hostNodes()
    confirmBtn.simulate('click')
    component.update()
    const modalIsDisplayed = !!component
      .find('#confirm-print-modal')
      .hostNodes().length
    expect(modalIsDisplayed).toBe(true)
  })

  it('Should close the modal on clicking the print the button', async () => {
    const confirmBtn = await waitForElement(component, '#confirm-print')
    confirmBtn.hostNodes().simulate('click')
    component.update()

    component
      .find('#print-certificate')
      .hostNodes()
      .simulate('click')
    component.update()

    const modalIsClosed = !!component.find('#confirm-print-modal').hostNodes()
      .length

    expect(modalIsClosed).toBe(false)
  })
})

describe('back button behavior tests of review certificate action', () => {
  let component: ReactWrapper
  const { store, history } = createStore()

  beforeEach(() => {
    store.dispatch(checkAuth({ '?token': validToken }))
    const mockBirthApplicationData = cloneDeep(mockApplicationData)
    mockBirthApplicationData.registration.certificates[0] = {
      collector: {
        type: 'PRINT_IN_ADVANCE'
      }
    }
    store.dispatch(
      storeApplication(({
        id: 'asdhdqe2472487jsdfsdf',
        data: mockBirthApplicationData,
        event: Event.BIRTH
      } as unknown) as IApplication)
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('takes user history back when navigated from inside app', async () => {
    history.push(history.location.pathname, { isNavigatedInsideApp: true })
    history.goBack = jest.fn()
    const testComponent = await createTestComponent(
      <ReviewCertificateAction
        location={history.location}
        history={history}
        match={{
          params: {
            registrationId: 'asdhdqe2472487jsdfsdf',
            eventType: Event.BIRTH
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    testComponent.component.update()
    component = testComponent.component

    component
      .find('#action_page_back_button')
      .hostNodes()
      .simulate('click')
    expect(history.goBack).toBeCalledTimes(1)
  })

  it('takes user to registration home when navigated from external link', async () => {
    history.push(history.location.pathname)
    history.push = jest.fn()
    const testComponent = await createTestComponent(
      <ReviewCertificateAction
        location={history.location}
        history={history}
        match={{
          params: {
            registrationId: 'asdhdqe2472487jsdfsdf',
            eventType: Event.BIRTH
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    testComponent.component.update()
    component = testComponent.component

    component
      .find('#action_page_back_button')
      .hostNodes()
      .simulate('click')
    await flushPromises()
    expect(history.push).toBeCalledWith('/registration-home/print/')
  })
})
