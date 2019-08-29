import * as React from 'react'
import { createStore } from '@register/store'
import { storeApplication } from '@register/applications'
import {
  validToken,
  createTestComponent,
  mockApplicationData,
  mockUserResponse,
  mockDeathApplicationData
} from '@register/tests/util'
import { ReviewCertificateAction } from './ReviewCertificateAction'
import { ReactWrapper } from 'enzyme'
import { Event } from '@register/forms'
import { REGISTRAR_ROLES } from '@register/utils/constants'
import { queries } from '@register/profile/queries'
import { merge } from 'lodash'
import { checkAuth } from '@register/profile/profileActions'
import { waitForElement } from '@register/tests/wait-for-element'

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
const getItem = window.localStorage.getItem as jest.Mock
;(queries.fetchUserDetails as jest.Mock).mockReturnValue(mockUserResponse)

describe('when user wants to review death certificate', () => {
  const { store, history } = createStore()
  const mockLocation: any = jest.fn()

  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    getItem.mockReturnValue(validToken)
    store.dispatch(checkAuth({ '?token': validToken }))

    store.dispatch(
      storeApplication({
        id: 'mockDeath1234',
        data: mockDeathApplicationData,
        event: Event.DEATH
      })
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    const testComponent = createTestComponent(
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
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()

    component = testComponent.component
  })

  it('Should display have the Confirm And print Button', async () => {
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
    getItem.mockReturnValue(validToken)
    store.dispatch(checkAuth({ '?token': validToken }))

    store.dispatch(
      storeApplication({
        id: 'asdhdqe2472487jsdfsdf',
        data: mockApplicationData,
        event: Event.BIRTH
      })
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    const testComponent = createTestComponent(
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
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()

    component = testComponent.component
  })

  it('Should display have the Confirm And print Button', () => {
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
