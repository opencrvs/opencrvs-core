import * as React from 'react'
import { createStore } from '@register/store'
import {
  createTestComponent,
  mockApplicationData,
  mockDeathApplicationData
} from '@register/tests/util'
import { VerifyCollector } from './VerifyCollector'
import { storeApplication } from '@register/applications'
import { Event } from '@register/forms'
import { ReactWrapper } from 'enzyme'

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

    it('when mother is collector renders idVerifier component', () => {
      const testComponent = createTestComponent(
        // @ts-ignore
        <VerifyCollector
          history={history}
          match={{
            params: {
              registrationId: 'mockBirth1234',
              eventType: Event.BIRTH,
              collector: 'mother'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      ).component

      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })

    describe('when father is collector', () => {
      let testComponent: ReactWrapper
      beforeEach(() => {
        testComponent = createTestComponent(
          // @ts-ignore
          <VerifyCollector
            history={history}
            match={{
              params: {
                registrationId: 'mockBirth1234',
                eventType: Event.BIRTH,
                collector: 'father'
              },
              isExact: true,
              path: '',
              url: ''
            }}
          />,
          store
        ).component
      })

      it('renders idVerifier compomnent', () => {
        expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
      })

      it('clicking on yes button takes user to review certificate if there is no fee', () => {
        Date.now = jest.fn(() => 243885600000)

        testComponent
          .find('#idVerifier')
          .find('#verifyPositive')
          .hostNodes()
          .simulate('click')

        expect(history.location.pathname).toContain('review')
      })

      it('clicking on no button shows up modal', () => {
        testComponent
          .find('#idVerifier')
          .find('#verifyNegative')
          .hostNodes()
          .simulate('click')

        testComponent.update()

        expect(
          testComponent.find('#withoutVerificationPrompt').hostNodes()
        ).toHaveLength(1)
      })

      it('clicking on send button on modal takes user to payment if there is fee', () => {
        Date.now = jest.fn(() => 969732000000)

        testComponent
          .find('#idVerifier')
          .find('#verifyNegative')
          .hostNodes()
          .simulate('click')

        testComponent.update()

        testComponent
          .find('#withoutVerificationPrompt')
          .find('#send')
          .hostNodes()
          .simulate('click')

        expect(history.location.pathname).toContain('payment')
      })

      it('clicking on cancel button hides the modal', () => {
        testComponent
          .find('#idVerifier')
          .find('#verifyNegative')
          .hostNodes()
          .simulate('click')

        testComponent.update()

        testComponent
          .find('#withoutVerificationPrompt')
          .find('#cancel')
          .hostNodes()
          .simulate('click')

        testComponent.update()

        expect(
          testComponent.find('#withoutVerificationPrompt').hostNodes()
        ).toHaveLength(0)
      })
    })
  })

  describe('in case of death application renders idVerifier component', () => {
    beforeAll(() => {
      store.dispatch(storeApplication(deathApplication))
    })

    it('when informant is collector', () => {
      const testComponent = createTestComponent(
        // @ts-ignore
        <VerifyCollector
          history={history}
          match={{
            params: {
              registrationId: 'mockDeath1234',
              eventType: Event.DEATH,
              collector: 'informant'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      ).component

      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })
  })
})
