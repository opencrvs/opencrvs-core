import * as React from 'react'
import { createStore } from '@register/store'
import {
  createTestComponent,
  mockApplicationData,
  mockDeathApplicationData,
  validToken,
  mockUserResponse
} from '@register/tests/util'
import { storeApplication } from '@register/applications'
import { Event } from '@register/forms'
import { Payment } from './Payment'
import * as PDFUtils from '@register/views/PrintCertificate/PDFUtils'
import { queries } from '@register/profile/queries'
import { checkAuth } from '@register/profile/profileActions'

const getItem = window.localStorage.getItem as jest.Mock
;(queries.fetchUserDetails as jest.Mock).mockReturnValue(mockUserResponse)

describe('verify collector tests', () => {
  const { store, history } = createStore()
  const mockLocation: any = jest.fn()

  const birthApplication = {
    id: 'mockBirth1234',
    data: mockApplicationData,
    event: Event.BIRTH
  }

  const deathApplication = {
    id: 'mockDeath1234',
    data: mockDeathApplicationData,
    event: Event.DEATH
  }

  describe('in case of birth application', () => {
    beforeAll(() => {
      getItem.mockReturnValue(validToken)
      store.dispatch(checkAuth({ '?token': validToken }))

      store.dispatch(storeApplication(birthApplication))
    })

    it('when mother is collector renders Payment component', async () => {
      const testComponent = (await createTestComponent(
        <Payment
          history={history}
          location={mockLocation}
          match={{
            params: {
              registrationId: 'mockBirth1234',
              eventType: Event.BIRTH
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )).component

      expect(
        testComponent
          .find('#service')
          .hostNodes()
          .text()
      ).toContain('Birth')

      expect(
        testComponent
          .find('#amountDue')
          .hostNodes()
          .text()
      ).toContain('50')

      testComponent
        .find('#Continue')
        .hostNodes()
        .simulate('click')
    })

    it('print payment receipt', async () => {
      const printMoneyReceiptSpy = jest.spyOn(PDFUtils, 'printMoneyReceipt')
      const testComponent = (await createTestComponent(
        <Payment
          location={mockLocation}
          history={history}
          match={{
            params: {
              registrationId: 'mockBirth1234',
              eventType: Event.BIRTH
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )).component

      testComponent
        .find('#print-receipt')
        .hostNodes()
        .simulate('click')

      expect(printMoneyReceiptSpy).toBeCalled()
    })

    it('invalid application id', () => {
      expect(
        createTestComponent(
          <Payment
            location={mockLocation}
            history={history}
            match={{
              params: {
                registrationId: 'mockBirth',
                eventType: Event.BIRTH
              },
              isExact: true,
              path: '',
              url: ''
            }}
          />,
          store
        )
      ).rejects.toEqual(new Error('Application "mockBirth" missing!'))
    })
  })

  describe('in case of death application renders payment component', () => {
    beforeAll(() => {
      store.dispatch(storeApplication(deathApplication))
    })

    it('when informant is collector', async () => {
      const testComponent = (await createTestComponent(
        <Payment
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
      )).component

      expect(
        testComponent
          .find('#service')
          .hostNodes()
          .text()
      ).toContain('Death')
    })
  })
})
