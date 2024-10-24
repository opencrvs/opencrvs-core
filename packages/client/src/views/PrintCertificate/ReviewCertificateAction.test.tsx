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
import { vi, Mock } from 'vitest'
import * as React from 'react'
import { createStore } from '@client/store'
import { storeDeclaration } from '@client/declarations'
import {
  createTestComponent,
  mockDeclarationData,
  mockDeathDeclarationData,
  mockMarriageDeclarationData,
  flushPromises,
  loginAsFieldAgent,
  createRouterProps
} from '@client/tests/util'
import { ReviewCertificate } from './ReviewCertificateAction'
import { ReactWrapper } from 'enzyme'
import { IFormSectionData } from '@client/forms'
import { Event } from '@client/utils/gateway'
import { cloneDeep } from 'lodash'
import { waitForElement } from '@client/tests/wait-for-element'
import { push } from 'connected-react-router'
import { useParams } from 'react-router'

const mockSvgTemplate = '<svg><text>Sample Certificate</text></svg>'
const birthDeclaration = {
  id: 'mockBirth1234',
  data: {
    ...mockDeclarationData,
    history: [
      {
        date: '2022-03-21T08:16:24.467+00:00',
        regStatus: 'REGISTERED',
        reinstated: false
      }
    ] as unknown as IFormSectionData
  },
  event: Event.Birth
}

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
    ] as unknown as IFormSectionData
  },
  event: Event.Death
}

const marriageDeclaration = {
  id: 'mockMarriage1234',
  data: {
    ...mockMarriageDeclarationData,
    history: [
      {
        date: '2022-03-21T08:16:24.467+00:00',
        regStatus: 'REGISTERED',
        reinstated: false
      }
    ] as unknown as IFormSectionData
  },
  event: Event.Marriage
}

async function setupTest({
  declaration,
  registrationId
}: {
  declaration: any
  registrationId: string
}) {
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      text: vi.fn().mockResolvedValue(mockSvgTemplate)
    })
  )

  const { history, match } = createRouterProps(
    '/',
    { isNavigatedInsideApp: false },
    {
      matchParams: {
        registrationId
      }
    }
  )

  ;(useParams as Mock).mockImplementation(() => match.params)

  const { store } = createStore(history)
  loginAsFieldAgent(store)
  const clonedDeclaration = cloneDeep(declaration)

  await flushPromises()
  store.dispatch(storeDeclaration(clonedDeclaration))

  const component = await createTestComponent(<ReviewCertificate />, {
    store,
    history
  })

  await flushPromises()
  component.update()

  return component
}

describe('Review Certificate Tests', () => {
  let component: ReactWrapper<{}, {}>

  describe('when user wants to review death certificate', () => {
    beforeEach(async () => {
      component = await setupTest({
        declaration: deathDeclaration,
        registrationId: 'mockDeath1234'
      })
    })

    it('displays the "Confirm & Print" button', async () => {
      const confirmBtnExist = !!(
        await waitForElement(component, '#confirm-print')
      ).hostNodes().length
      expect(confirmBtnExist).toBe(true)
    })
  })

  describe('when user wants to review birth certificate', () => {
    beforeEach(async () => {
      component = await setupTest({
        declaration: birthDeclaration,
        registrationId: 'mockBirth1234'
      })
    })

    it('displays the "Confirm & Print" button', async () => {
      const confirmBtnExist = !!(
        await waitForElement(component, '#confirm-print')
      ).hostNodes().length
      expect(confirmBtnExist).toBe(true)
    })

    it('shows the Confirm Print Modal', async () => {
      const confirmBtn = await waitForElement(component, '#confirm-print')
      confirmBtn.hostNodes().simulate('click')
      component.update()
      const modal = await waitForElement(component, '#confirm-print-modal')
      const modalIsDisplayed = !!modal.hostNodes().length
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
    beforeEach(async () => {
      component = await setupTest({
        declaration: marriageDeclaration,
        registrationId: 'mockMarriage1234'
      })
    })

    it('displays the "Confirm & Print" button', async () => {
      const confirmBtnExist = !!(
        await waitForElement(component, '#confirm-print')
      ).hostNodes().length
      expect(confirmBtnExist).toBe(true)
    })

    it('shows the Confirm Print Modal', async () => {
      const confirmBtn = await waitForElement(component, '#confirm-print')
      confirmBtn.hostNodes().simulate('click')
      component.update()
      const modalIsDisplayed = !!(
        await waitForElement(component, '#confirm-print-modal')
      ).hostNodes().length
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
})

describe('Back button behavior tests of review certificate action', () => {
  let component: ReactWrapper

  it('takes user history back when navigated from inside app', async () => {
    const { history, match } = createRouterProps(
      '/previous-route',
      { isNavigatedInsideApp: true },
      {
        matchParams: {
          registrationId: 'asdhdqe2472487jsdfsdf',
          eventType: Event.Birth
        }
      }
    )
    ;(useParams as Mock).mockImplementation(() => match.params)

    const { store } = createStore(history)

    store.dispatch(push('/new-route', { isNavigatedInsideApp: true }))
    loginAsFieldAgent(store)

    store.dispatch(storeDeclaration(birthDeclaration))

    component = await createTestComponent(<ReviewCertificate />, {
      store,
      history
    })

    component.find('#action_page_back_button').hostNodes().simulate('click')
    expect(history.location.pathname).toBe('/previous-route')
  })

  it('takes user to registration home when navigated from external link', async () => {
    const { history, match } = createRouterProps(
      '/previous-route',
      { isNavigatedInsideApp: false },
      {
        matchParams: {
          registrationId: 'mockBirth1234',
          eventType: Event.Birth
        }
      }
    )
    ;(useParams as Mock).mockImplementation(() => match.params)
    const { store } = createStore(history)

    loginAsFieldAgent(store)

    store.dispatch(storeDeclaration(birthDeclaration))

    component = await createTestComponent(<ReviewCertificate />, {
      store,
      history
    })

    component.find('#action_page_back_button').hostNodes().simulate('click')

    expect(history.location.pathname).toContain('/registration-home/print/')
  })
})
