import * as React from 'react'
import { createTestComponent } from '../../tests/util'
import { ConfirmationScreen } from './ConfirmationScreen'
import { ReactWrapper } from 'enzyme'
import { createStore } from '../../store'
import { DECLARATION, SUBMISSION } from 'src/utils/constants'

const fullNameInBn = 'টম ব্র্যাডি'
const fullNameInEng = 'Tom Brady'

describe('when user is in the confirmation screen page', () => {
  const { store, history } = createStore()

  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '1245lsajd',
    nextSection: true,
    trackingSection: true,
    eventName: DECLARATION,
    actionName: SUBMISSION,
    fullNameInBn,
    fullNameInEng
  })
  describe('when the application is online', () => {
    beforeEach(async () => {
      const testComponent = createTestComponent(
        <ConfirmationScreen
          location={history.location}
          history={history}
          staticContext={mock}
          match={{
            params: {},
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      confirmationScreenComponent = testComponent.component
    })
    it('should show the online title', () => {
      expect(
        confirmationScreenComponent
          .find('#submission_title')
          .first()
          .text()
      ).toEqual('All done!')
    })
    it('should show the online text', () => {
      expect(
        confirmationScreenComponent
          .find('#submission_text')
          .first()
          .text()
      ).toEqual(`The birth application of ${fullNameInEng} has been submitted.`)
    })
    it('should show the online whats next title', () => {
      expect(
        confirmationScreenComponent
          .find('#whats_next_title')
          .first()
          .text()
      ).toEqual(
        'You will be notified through OpenCRVS when registration is complete or if there are any delays in the process.'
      )
    })
    it('should show the online whats next text', () => {
      expect(
        confirmationScreenComponent
          .find('#whats_next_text')
          .first()
          .text()
      ).toEqual(
        'The informant has given their contact details and will also be informed when the registration is complete.'
      )
    })
  })
  describe('when the application is offline', () => {
    beforeEach(async () => {
      Object.defineProperty(window.navigator, 'onLine', { value: false })
      const testComponent = createTestComponent(
        <ConfirmationScreen
          location={history.location}
          history={history}
          staticContext={mock}
          match={{
            params: {},
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      confirmationScreenComponent = testComponent.component
    })
    it('should show the offline title', () => {
      expect(
        confirmationScreenComponent
          .find('#submission_title')
          .first()
          .text()
      ).toEqual('Almost there')
    })
    it('should show the offline text', () => {
      expect(
        confirmationScreenComponent
          .find('#submission_text')
          .first()
          .text()
      ).toEqual(
        `The birth application of ${fullNameInEng} is pending due to internet connection.`
      )
    })
    it('should show the offline whats next title', () => {
      expect(
        confirmationScreenComponent
          .find('#whats_next_title')
          .first()
          .text()
      ).toEqual(
        'All you need to do is login once you have internet connectivity on your device within the next 7 days. OpenCRVS will automatically submit the form, so you won’t need to do anything else.'
      )
    })
    it('should show the offline whats next text', () => {
      expect(
        confirmationScreenComponent
          .find('#whats_next_text')
          .first()
          .text()
      ).toEqual(
        'Once the application is succesfully submited, you and the informant will be notified when the registration is complete.'
      )
    })
  })
})
