import * as React from 'react'
import { createStore } from '@register/store'
import {
  createTestComponent,
  mockApplicationData,
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

  describe('in case of birth application', () => {
    beforeAll(() => {
      getItem.mockReturnValue(validToken)
      store.dispatch(checkAuth({ '?token': validToken }))

      store.dispatch(storeApplication(birthApplication))
    })

    it('when mother is collector renders Payment component', async () => {
      const testComponent = await createTestComponent(
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
      )

      expect(
        testComponent.component
          .find('#service')
          .hostNodes()
          .text()
      ).toContain('Birth')

      expect(
        testComponent.component
          .find('#amountDue')
          .hostNodes()
          .text()
      ).toContain('50')

      testComponent.component
        .find('#Continue')
        .hostNodes()
        .simulate('click')
    })

    it('print payment receipt', async () => {
      const printMoneyReceiptSpy = jest.spyOn(PDFUtils, 'printMoneyReceipt')
      const testComponent = await createTestComponent(
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
      )

      testComponent.component
        .find('#print-receipt')
        .hostNodes()
        .simulate('click')

      expect(printMoneyReceiptSpy).toBeCalled()
    })

    it('invalid application id', async () => {
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
})
