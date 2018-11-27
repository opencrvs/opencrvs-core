import * as React from 'react'
import { createTestComponent } from '../../tests/util'
import { SavedRegistration } from './SavedRegistration'
import { ReactWrapper } from 'enzyme'
import { createStore } from '../../store'

describe('when user is in the saved registration page', () => {
  const { store, history } = createStore()

  const mock: any = jest.fn()
  let savedRegistrationComponent: ReactWrapper<{}, {}>
  history.push('/saved', {
    trackingId: '1245lsajd',
    declaration: true
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
        'The birth declaration of First Last Name has been successfully submitted to the registration office.'
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
        'The birth declaration of First Last Name is pending due to no internet connection. '
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
        'Once the declaration is succesfully submited, you and the informant will be notified when the registration is complete.'
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
    declaration: false
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
    ).toEqual('The birth of First Middle Last Name has been registered.')
  })
})
