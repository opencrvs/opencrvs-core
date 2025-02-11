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
import { createStore } from '@client/store'
import { storeDeclaration, IDeclaration } from '@client/declarations'
import {
  createTestComponent,
  mockDeclarationData,
  mockDeathDeclarationData,
  mockMarriageDeclarationData,
  flushPromises,
  loginAsFieldAgent
} from '@client/tests/util'
import { ReviewCertificate } from './ReviewCertificateAction'
import { ReactWrapper } from 'enzyme'
import { IFormSectionData } from '@client/forms'
import { EventType } from '@client/utils/gateway'
import { cloneDeep } from 'lodash'
import { waitForElement } from '@client/tests/wait-for-element'
import { formatUrl } from '@client/navigation'
import { REVIEW_CERTIFICATE } from '@client/navigation/routes'

const deathDeclaration = {
  id: 'mockDeath1234',
  data: {
    ...mockDeathDeclarationData,
    history: [
      {
        date: '2022-03-21T08:16:24.467+00:00',
        regStatus: 'REGISTERED',
        reinstated: false
      }
    ]
  },
  event: EventType.Death
}

describe('when user wants to review death certificate', () => {
  it('displays the "Confirm & Print" button', async () => {
    const { store } = createStore()

    loginAsFieldAgent(store)

    const { component } = await createTestComponent(<ReviewCertificate />, {
      store,
      path: REVIEW_CERTIFICATE,
      initialEntries: [
        {
          pathname: formatUrl(REVIEW_CERTIFICATE, {
            registrationId: 'mockDeath1234',
            eventType: EventType.Death
          }),
          state: { isNavigatedInsideApp: false }
        }
      ]
    })

    // @ts-ignore
    store.dispatch(storeDeclaration(deathDeclaration))
    component.update()

    const confirmBtn = component.find('#confirm-print')
    const confirmBtnExist = !!confirmBtn.hostNodes().length
    expect(confirmBtnExist).toBe(true)
  })
})

describe('back button behavior tests of review certificate action', () => {
  const mockBirthDeclarationData = {
    ...cloneDeep(mockDeclarationData),
    history: [
      {
        date: '2022-03-21T08:16:24.467+00:00',
        regStatus: 'REGISTERED',
        reinstated: false
      }
    ]
  }
  mockBirthDeclarationData.registration.certificates[0] = {
    //@ts-ignore
    collector: {
      type: 'PRINT_IN_ADVANCE'
    },
    certificateTemplateId: 'death-certificate'
  }

  it('takes user history back when navigated from inside app', async () => {
    const { store } = createStore()

    loginAsFieldAgent(store)
    const birthDeclaration = {
      id: 'asdhdqe2472487jsdfsdf',
      data: mockBirthDeclarationData,
      event: EventType.Birth
    }
    store.dispatch(
      // @ts-ignore
      storeDeclaration(birthDeclaration)
    )
    const { component, router } = await createTestComponent(
      <ReviewCertificate />,
      {
        store,
        path: '*',
        initialEntries: [
          {
            pathname: formatUrl(REVIEW_CERTIFICATE, {
              registrationId: 'asdhdqe2472487jsdfsdf',
              eventType: EventType.Birth
            }),
            state: { isNavigatedInsideApp: true }
          },
          {
            pathname: '',
            state: { isNavigatedInsideApp: true }
          }
        ]
      }
    )

    component.find('#action_page_back_button').hostNodes().simulate('click')
    expect(router.state.location.pathname).toBe(
      formatUrl(REVIEW_CERTIFICATE, {
        registrationId: 'asdhdqe2472487jsdfsdf',
        eventType: EventType.Birth
      })
    )
  })

  it('takes user to registration home when navigated from external link', async () => {
    const { store } = createStore()

    loginAsFieldAgent(store)
    store.dispatch(
      // @ts-ignore
      storeDeclaration({
        id: 'asdhdqe2472487jsdfsdf',
        data: mockBirthDeclarationData,
        event: EventType.Birth
      } as IDeclaration)
    )
    const { component, router } = await createTestComponent(
      <ReviewCertificate />,
      {
        store,
        initialEntries: [
          {
            pathname: formatUrl(REVIEW_CERTIFICATE, {
              registrationId: 'asdhdqe2472487jsdfsdf',
              eventType: EventType.Birth
            }),
            state: { isNavigatedInsideApp: false }
          }
        ]
      }
    )

    component.find('#action_page_back_button').hostNodes().simulate('click')
    await flushPromises()
    expect(router.state.location.pathname).toContain(
      '/registration-home/print/'
    )
  })
})

describe('when user wants to review birth certificate', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()

    const mockBirthDeclarationData = cloneDeep(mockDeclarationData)
    mockBirthDeclarationData.registration.certificates[0] = {
      //@ts-ignore
      collector: {
        type: 'PRINT_IN_ADVANCE'
      },
      certificateTemplateId: 'birth-certificate'
    }
    loginAsFieldAgent(store)
    await flushPromises()
    store.dispatch(
      storeDeclaration({
        id: 'asdhdqe2472487jsdfsdf',
        data: {
          ...mockBirthDeclarationData,
          history: [
            {
              date: '2022-03-21T08:16:24.467+00:00',
              regStatus: 'REGISTERED',
              reinstated: false
            }
          ] as unknown as IFormSectionData
        },
        event: EventType.Birth
      })
    )

    const { component: testComponent } = await createTestComponent(
      <ReviewCertificate />,
      {
        store,
        path: REVIEW_CERTIFICATE,
        initialEntries: [
          {
            pathname: formatUrl(REVIEW_CERTIFICATE, {
              registrationId: 'asdhdqe2472487jsdfsdf',
              eventType: EventType.Birth
            }),
            state: { isNavigatedInsideApp: false }
          }
        ]
      }
    )
    await flushPromises()
    testComponent.update()

    component = testComponent
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

describe('when user wants to review marriage certificate', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()

    const mockMarriageData = cloneDeep(mockMarriageDeclarationData)

    loginAsFieldAgent(store)
    await flushPromises()
    store.dispatch(
      storeDeclaration({
        id: '1234896128934719',
        data: {
          ...mockMarriageData,
          history: [
            {
              date: '2022-03-21T08:16:24.467+00:00',
              regStatus: 'REGISTERED',
              reinstated: false
            }
          ] as unknown as IFormSectionData
        },
        event: EventType.Marriage
      })
    )

    const { component: testComponent } = await createTestComponent(
      <ReviewCertificate />,
      {
        store,
        path: REVIEW_CERTIFICATE,
        initialEntries: [
          {
            pathname: formatUrl(REVIEW_CERTIFICATE, {
              registrationId: '1234896128934719',
              eventType: EventType.Birth
            }),
            state: { isNavigatedInsideApp: false }
          }
        ]
      }
    )
    await flushPromises()
    testComponent.update()

    component = testComponent
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
