import * as React from 'react'
import { createTestComponent } from '../../tests/util'
import { ConfirmationScreen } from './ConfirmationScreen'
import { ReactWrapper } from 'enzyme'
import { createStore } from '../../store'
import {
  DECLARATION,
  SUBMISSION,
  DEATH,
  REGISTRATION,
  REGISTERED,
  CERTIFICATION,
  COMPLETION,
  REJECTION,
  DUPLICATION
} from 'src/utils/constants'

const fullNameInBn = 'টম ব্র্যাডি'
const fullNameInEng = 'Tom Brady'

describe('when user is in the confirmation screen page for birth declaration', () => {
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
          location={mock}
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
      ).toEqual(
        `The birth declaration of ${fullNameInEng} has been successfully submitted to the registration office.`
      )
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
      Object.defineProperty(window.navigator, 'onLine', {
        value: false,
        writable: true
      })
      const testComponent = createTestComponent(
        <ConfirmationScreen
          location={mock}
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
        `The birth declaration of ${fullNameInEng} is pending due to internet connection.`
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

describe('when user is in the confirmation screen page for death declarartion', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '1245lsajd',
    trackingSection: true,
    eventName: DECLARATION,
    actionName: SUBMISSION,
    eventType: DEATH,
    fullNameInBn,
    fullNameInEng
  })

  describe('when the application is online', () => {
    beforeEach(async () => {
      Object.defineProperty(window.navigator, 'onLine', { value: true })
      const testComponent = createTestComponent(
        <ConfirmationScreen
          location={mock}
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
      ).toEqual(
        `The death declaration of ${fullNameInEng} has been successfully submitted to the registration office.`
      )
    })
  })
  describe('when the application is offline', () => {
    beforeEach(async () => {
      Object.defineProperty(window.navigator, 'onLine', { value: false })
      const testComponent = createTestComponent(
        <ConfirmationScreen
          location={mock}
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
        `The death declaration of ${fullNameInEng} is pending due to internet connection.`
      )
    })
  })
})

describe('when user is in the confirmation screen page for birth registration', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '1258764130017892446',
    trackingSection: true,
    eventName: REGISTRATION,
    actionName: REGISTERED,
    fullNameInBn,
    fullNameInEng
  })

  describe('when the application is online', () => {
    beforeEach(async () => {
      Object.defineProperty(window.navigator, 'onLine', { value: true })
      const testComponent = createTestComponent(
        <ConfirmationScreen
          location={mock}
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
    it('should show icon header title', () => {
      expect(
        confirmationScreenComponent
          .find('#submission_title')
          .first()
          .text()
      ).toEqual(`Application registered`)
    })
    it('should show the icon header text ', () => {
      expect(
        confirmationScreenComponent
          .find('#submission_text')
          .first()
          .text()
      ).toEqual(`The birth of ${fullNameInEng} has been registered`)
    })
    it('should show tracking header', () => {
      expect(
        confirmationScreenComponent
          .find('#trackingSecHeader')
          .first()
          .text()
      ).toEqual(`Birth Registration Number:  `)
    })
    it('should show the tracking id', () => {
      expect(
        confirmationScreenComponent
          .find('#trackingIdViewer')
          .first()
          .text()
      ).toEqual(`1258764130017892446`)
    })
    it('should show the tracking text', () => {
      expect(
        confirmationScreenComponent
          .find('#trackingSecText')
          .first()
          .text()
      ).toEqual(
        `The informant will receive this number via SMS with instructions on how and where to collect the certificate. They should use the number as a reference if enquiring about their registration. `
      )
    })
  })
})

describe('when user is in the confirmation screen page for birth certification', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '103',
    trackingSection: true,
    eventName: CERTIFICATION,
    actionName: COMPLETION,
    fullNameInBn,
    fullNameInEng
  })

  describe('when the application is online', () => {
    beforeEach(async () => {
      Object.defineProperty(window.navigator, 'onLine', { value: true })
      const testComponent = createTestComponent(
        <ConfirmationScreen
          location={mock}
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
    it('should show icon header title', () => {
      expect(
        confirmationScreenComponent
          .find('#submission_title')
          .first()
          .text()
      ).toEqual(`All done!`)
    })
    it('should show the icon header text ', () => {
      expect(
        confirmationScreenComponent
          .find('#submission_text')
          .first()
          .text()
      ).toEqual(`The birth certificate of ${fullNameInEng} has been completed.`)
    })
    it('should show the tracking id', () => {
      expect(
        confirmationScreenComponent
          .find('#trackingIdViewer')
          .first()
          .text()
      ).toEqual(`103`)
    })
    it('should show the tracking text', () => {
      expect(
        confirmationScreenComponent
          .find('#trackingSecText')
          .first()
          .text()
      ).toEqual(`Certificates have been collected from your jurisdiction. `)
    })
  })
})

describe('when user is in the confirmation screen page for birth declaration rejection', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '123456',
    eventName: DECLARATION,
    actionName: REJECTION,
    fullNameInBn,
    fullNameInEng
  })

  describe('when the application is online', () => {
    beforeEach(async () => {
      Object.defineProperty(window.navigator, 'onLine', { value: true })
      const testComponent = createTestComponent(
        <ConfirmationScreen
          location={mock}
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
    it('should show icon header title', () => {
      expect(
        confirmationScreenComponent
          .find('#submission_title')
          .first()
          .text()
      ).toEqual(`Application rejected`)
    })
    it('should show the icon header text ', () => {
      expect(
        confirmationScreenComponent
          .find('#submission_text')
          .first()
          .text()
      ).toEqual(`The birth declaration of ${fullNameInEng} has been rejected.`)
    })
  })
})

describe('when user is in the confirmation screen page for birth duplication rejection', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '123456',
    eventName: DUPLICATION,
    actionName: REJECTION,
    fullNameInBn,
    fullNameInEng
  })

  describe('when the application is online', () => {
    beforeEach(async () => {
      Object.defineProperty(window.navigator, 'onLine', { value: true })
      const testComponent = createTestComponent(
        <ConfirmationScreen
          location={mock}
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
    it('should show icon header title', () => {
      expect(
        confirmationScreenComponent
          .find('#submission_title')
          .first()
          .text()
      ).toEqual(`Application rejected`)
    })
    it('should show the icon header text ', () => {
      expect(
        confirmationScreenComponent
          .find('#submission_text')
          .first()
          .text()
      ).toEqual(`The birth duplication of ${fullNameInEng} has been rejected.`)
    })
    it('should show the back to duplication text ', () => {
      expect(
        confirmationScreenComponent
          .find('#go_to_duplicate_button')
          .first()
          .text()
      ).toEqual(`Back to duplicate`)
    })
  })
})
