import * as React from 'react'
import { createStore } from '@register/store'
import { storeApplication, IApplication } from '@register/applications'
import {
  createTestComponent,
  mockApplicationData,
  mockUserResponse,
  mockDeathApplicationData,
  validToken
} from '@register/tests/util'
import { ReviewCertificateAction } from './ReviewCertificateAction'
import { ReactWrapper } from 'enzyme'
import { Event } from '@register/forms'
import { REGISTRAR_ROLES } from '@register/utils/constants'
import { queries } from '@register/profile/queries'
import { merge } from 'lodash'
import { waitForElement } from '@register/tests/wait-for-element'
import { checkAuth } from '@register/profile/profileActions'

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
    await store.dispatch(
      storeApplication(({
        id: 'mockDeath1234',
        data: mockDeathApplicationData,
        event: Event.DEATH
      } as unknown) as IApplication)
    )
    await store.dispatch(checkAuth({ '?token': validToken }))
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
    await store.dispatch(
      storeApplication(({
        id: 'asdhdqe2472487jsdfsdf',
        data: mockApplicationData,
        event: Event.BIRTH
      } as unknown) as IApplication)
    )

    await store.dispatch(checkAuth({ '?token': validToken }))

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
