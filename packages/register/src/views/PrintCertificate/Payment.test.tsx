import * as React from 'react'
import { createStore } from '@register/store'
import {
  createTestComponent,
  mockApplicationData,
  mockDeathApplicationData
} from '@register/tests/util'
import { storeApplication } from '@register/applications'
import { Event } from '@register/forms'
import { Payment } from './Payment'

describe('verify collector tests', () => {
  const { store, history } = createStore()

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
      store.dispatch(storeApplication(birthApplication))
    })

    it('when mother is collector renders Payment component', () => {
      const testComponent = createTestComponent(
        // @ts-ignore
        <Payment
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
      ).component

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

    it('invalid application id', () => {
      try {
        createTestComponent(
          // @ts-ignore
          <Payment
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
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })
  })

  describe('in case of death application renders payment component', () => {
    beforeAll(() => {
      store.dispatch(storeApplication(deathApplication))
    })

    it('when informant is collector', () => {
      const testComponent = createTestComponent(
        // @ts-ignore
        <Payment
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
      ).component

      expect(
        testComponent
          .find('#service')
          .hostNodes()
          .text()
      ).toContain('Death')
    })
  })
})
