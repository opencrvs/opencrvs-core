import * as React from 'react'
import { createTestComponent } from '../../tests/util'
import { SavedRegistration } from './SavedRegistration'
import { ReactWrapper } from 'enzyme'
import { createStore } from '../../store'

const fullNameInBn = 'টম ব্র্যাডি'
const fullNameInEng = 'Tom Brady'

describe('when user is in the saved registration page', () => {
  const { store, history } = createStore()

  const mock: any = jest.fn()
  let savedRegistrationComponent: ReactWrapper<{}, {}>
  history.push('/saved', {
    trackingId: '1245lsajd',
    declaration: true,
    fullNameInBn,
    fullNameInEng
  })
  describe('when the application is online', () => {
    beforeEach(async () => {
      const testComponent = createTestComponent(
        <SavedRegistration
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
      savedRegistrationComponent = testComponent.component
    })
    it('should show the online title', () => {
      expect(
        savedRegistrationComponent
          .find('#submission_title')
          .first()
          .text()
      ).toEqual('All done!')
    })
    it('should show the online text', () => {
      expect(
        savedRegistrationComponent
          .find('#submission_text')
          .first()
          .text()
      ).toEqual(
        `The birth application of ${fullNameInEng} has been successfully submitted to the registration office.`
      )
    })
    it('should show the online whats next title', () => {
      expect(
        savedRegistrationComponent
          .find('#whats_next_title')
          .first()
          .text()
      ).toEqual(
        'You will be notified through OpenCRVS when registration is complete or if there are any delays in the process.'
      )
    })
    it('should show the online whats next text', () => {
      expect(
        savedRegistrationComponent
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
        <SavedRegistration
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
      savedRegistrationComponent = testComponent.component
    })
    it('should show the offline title', () => {
      expect(
        savedRegistrationComponent
          .find('#submission_title')
          .first()
          .text()
      ).toEqual('Almost there')
    })
    it('should show the offline text', () => {
      expect(
        savedRegistrationComponent
          .find('#submission_text')
          .first()
          .text()
      ).toEqual(
        `The birth application of ${fullNameInEng} is pending due to no internet connection.`
      )
    })
    it('should show the offline whats next title', () => {
      expect(
        savedRegistrationComponent
          .find('#whats_next_title')
          .first()
          .text()
      ).toEqual(
        'All you need to do is login once you have internet connectivity on your device within the next 7 days. OpenCRVS will automatically submit the form, so you won’t need to do anything else.'
      )
    })
    it('should show the offline whats next text', () => {
      expect(
        savedRegistrationComponent
          .find('#whats_next_text')
          .first()
          .text()
      ).toEqual(
        'Once the application is succesfully submited, you and the informant will be notified when the registration is complete.'
      )
    })
  })
})

describe('when user is in complete registration page', () => {
  const { store, history } = createStore()

  const mock: any = jest.fn()
  let savedRegistrationComponent: ReactWrapper<{}, {}>
  history.push('/saved', {
    trackingId: '123456789',
    declaration: false,
    fullNameInBn,
    fullNameInEng
  })

  beforeEach(async () => {
    const testComponent = createTestComponent(
      <SavedRegistration
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
    savedRegistrationComponent = testComponent.component
  })

  it('should show the notice card text', () => {
    expect(
      savedRegistrationComponent
        .find('#submission_text')
        .first()
        .text()
    ).toEqual(`The birth of ${fullNameInEng} has been registered.`)
  })
})

describe('when user is in reject registration page', () => {
  const { store, history } = createStore()

  const mock: any = jest.fn()
  let savedRegistrationComponent: ReactWrapper<{}, {}>
  history.push('/rejected', {
    trackingId: '123456789',
    rejection: true,
    fullNameInBn,
    fullNameInEng
  })

  beforeEach(async () => {
    const testComponent = createTestComponent(
      <SavedRegistration
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
    savedRegistrationComponent = testComponent.component
  })

  it('should show the rejection card text', () => {
    expect(
      savedRegistrationComponent
        .find('#submission_text')
        .first()
        .text()
    ).toEqual(
      `The birth application of Tom Brady has been rejected. The application agent will be informed about the reasons for rejection and instructed to follow up.`
    )
  })
})
