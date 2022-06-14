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
import { storeDeclaration, IDeclaration } from '@client/declarations'
import {
  createTestComponent,
  mockDeclarationData,
  mockDeathDeclarationData,
  flushPromises,
  loginAsFieldAgent,
  createRouterProps
} from '@client/tests/util'
import { ReviewCertificateAction } from './ReviewCertificateAction'
import { ReactWrapper } from 'enzyme'
import { Event, IFormSectionData } from '@client/forms'
import { cloneDeep } from 'lodash'
import { waitForElement } from '@client/tests/wait-for-element'
import { push } from 'connected-react-router'

describe('when user wants to review death certificate', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { history, location, match } = createRouterProps(
      '/',
      { isNavigatedInsideApp: false },
      {
        matchParams: {
          registrationId: 'mockDeath1234',
          eventType: Event.DEATH
        }
      }
    )
    const { store } = createStore(history)

    await loginAsFieldAgent(store)
    const deathDeclaration = {
      id: 'mockDeath1234',
      data: {
        ...mockDeathDeclarationData,
        history: [
          {
            date: '2022-03-21T08:16:24.467+00:00',
            action: 'REGISTERED',
            reinstated: false
          }
        ]
      },
      event: Event.DEATH
    }
    // @ts-ignore
    store.dispatch(storeDeclaration(deathDeclaration))
    component = await createTestComponent(
      <ReviewCertificateAction
        location={location}
        history={history}
        match={match}
      />,
      { store, history }
    )
  })

  it('displays have the Continue and print Button', async () => {
    const confirmBtn = await waitForElement(component, '#confirm-print')
    const confirmBtnExist = !!confirmBtn.hostNodes().length
    expect(confirmBtnExist).toBe(true)
  })
})

describe('back button behavior tests of review certificate action', () => {
  let component: ReactWrapper

  const mockBirthDeclarationData = cloneDeep(mockDeclarationData)
  mockBirthDeclarationData.registration.certificates[0] = {
    collector: {
      type: 'PRINT_IN_ADVANCE'
    }
  }

  it('takes user history back when navigated from inside app', async () => {
    const { history, location, match } = createRouterProps(
      '/previous-route',
      { isNavigatedInsideApp: true },
      {
        matchParams: {
          registrationId: 'asdhdqe2472487jsdfsdf',
          eventType: Event.BIRTH
        }
      }
    )
    const { store } = createStore(history)

    store.dispatch(push('/new-route', { isNavigatedInsideApp: true }))

    await loginAsFieldAgent(store)
    const birthDeclaration = {
      id: 'asdhdqe2472487jsdfsdf',
      data: {
        ...mockBirthDeclarationData,
        history: [
          {
            date: '2022-03-21T08:16:24.467+00:00',
            action: 'REGISTERED',
            reinstated: false
          }
        ]
      },
      event: Event.BIRTH
    }
    await store.dispatch(
      // @ts-ignore
      storeDeclaration(birthDeclaration)
    )
    component = await createTestComponent(
      <ReviewCertificateAction
        location={location}
        history={history}
        match={match}
      />,
      { store, history }
    )

    component.find('#action_page_back_button').hostNodes().simulate('click')
    expect(history.location.pathname).toBe('/previous-route')
  })

  it('takes user to registration home when navigated from external link', async () => {
    const { history, location, match } = createRouterProps(
      '/previous-route',
      { isNavigatedInsideApp: false },
      {
        matchParams: {
          registrationId: 'asdhdqe2472487jsdfsdf',
          eventType: Event.BIRTH
        }
      }
    )
    const { store } = createStore(history)

    await loginAsFieldAgent(store)
    await store.dispatch(
      storeDeclaration({
        id: 'asdhdqe2472487jsdfsdf',
        data: mockBirthDeclarationData,
        event: Event.BIRTH
      } as IDeclaration)
    )
    component = await createTestComponent(
      <ReviewCertificateAction
        location={location}
        history={history}
        match={match}
      />,
      { store, history }
    )

    component.find('#action_page_back_button').hostNodes().simulate('click')
    await flushPromises()
    expect(history.location.pathname).toBe('/registration-home/print/')
  })
})

describe('when user wants to review birth certificate', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { history, location, match } = createRouterProps(
      '/',
      { isNavigatedInsideApp: false },
      {
        matchParams: {
          registrationId: 'asdhdqe2472487jsdfsdf',
          eventType: Event.BIRTH
        }
      }
    )
    const { store } = createStore(history)

    const mockBirthDeclarationData = cloneDeep(mockDeclarationData)
    mockBirthDeclarationData.registration.certificates[0] = {
      collector: {
        type: 'PRINT_IN_ADVANCE'
      }
    }
    await loginAsFieldAgent(store)
    await store.dispatch(
      storeDeclaration({
        id: 'asdhdqe2472487jsdfsdf',
        data: {
          ...mockBirthDeclarationData,
          history: [
            {
              date: '2022-03-21T08:16:24.467+00:00',
              action: 'REGISTERED',
              reinstated: false
            }
          ] as unknown as IFormSectionData
        },
        event: Event.BIRTH
      })
    )

    component = await createTestComponent(
      <ReviewCertificateAction
        location={location}
        history={history}
        match={match}
      />,
      { store, history }
    )
  })

  it('displays have the Continue and print Button', () => {
    const confirmBtnExist = !!component.find('#confirm-print').hostNodes()
      .length
    expect(confirmBtnExist).toBe(true)
  })

  it('shows the Confirm Print Modal', () => {
    const confirmBtn = component.find('#confirm-print').hostNodes()
    confirmBtn.simulate('click')
    component.update()
    const modalIsDisplayed = !!component
      .find('#confirm-print-modal')
      .hostNodes().length
    expect(modalIsDisplayed).toBe(true)
  })

  it('closes the modal on clicking the print the button', async () => {
    const confirmBtn = await waitForElement(component, '#confirm-print')
    confirmBtn.hostNodes().simulate('click')
    component.update()

    component.find('#print-certificate').hostNodes().simulate('click')
    component.update()

    const modalIsClosed = !!component.find('#confirm-print-modal').hostNodes()
      .length

    expect(modalIsClosed).toBe(false)
  })
})
