import * as React from 'react'
import { createTestComponent, wait } from '@register/tests/util'
import { ConfirmationScreen } from '@register/views/ConfirmationScreen/ConfirmationScreen'
import { ReactWrapper } from 'enzyme'
import { createStore } from '@register/store'
import {
  DECLARATION,
  OFFLINE,
  REGISTRATION,
  CERTIFICATION,
  REJECTION,
  DUPLICATION,
  BIRTH,
  DEATH
} from '@register/utils/constants'

const fullNameInBn = 'টম ব্র্যাডি'
const fullNameInEng = 'Tom Brady'

describe('when user is in the confirmation screen page for birth declaration', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '1245LSAJD',
    trackingSection: true,
    eventName: DECLARATION,
    eventType: BIRTH,
    fullNameInBn,
    fullNameInEng
  })
  beforeEach(async () => {
    const testComponent = await createTestComponent(
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
  it('should show the submission text', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_text')
        .first()
        .text()
    ).toEqual(`birth application has been sent for review.`)
  })
  it('should show the submission icon', () => {
    expect(
      confirmationScreenComponent.find('#success_screen_icon').hostNodes()
        .length
    ).toEqual(1)
  })
  it('should show the online submission name', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_name')
        .first()
        .text()
    ).toEqual(`Tom Brady's`)
  })
  it('should show the tracking section header', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_header')
        .first()
        .text()
    ).toEqual(`Tracking number: `)
  })
  it('should show the tracking number ', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_id_viewer')
        .first()
        .text()
    ).toEqual(`1245LSAJD`)
  })
  it('should show the tracking section text', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_text')
        .first()
        .text()
    ).toEqual(
      `The informant will receive this number via SMS, but make sure they write it down and keep it safe. They should use the number as a reference if enquiring about their registration. `
    )
  })
  it('Should redirect the user to the homepage', async () => {
    confirmationScreenComponent
      .find('#go_to_homepage_button')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('/')
  })
  it('Should redirect the user to the new application', async () => {
    confirmationScreenComponent
      .find('#go_to_new_declaration')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('/')
  })
})

describe('when user is in the confirmation screen page for birth declaration in offline', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackingSection: true,
    eventName: OFFLINE,
    fullNameInBn,
    fullNameInEng: ''
  })
  beforeEach(async () => {
    window.location.assign = jest.fn()
    const testComponent = await createTestComponent(
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
  it('should show the submission text', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_text')
        .first()
        .text()
    ).toEqual(`birth application will be sent when you reconnect.`)
  })
  it('should show the submission icon', () => {
    expect(
      confirmationScreenComponent.find('#success_screen_icon').hostNodes()
        .length
    ).toEqual(1)
  })
  it('should show the online submission name', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_name')
        .first()
        .text()
    ).toEqual(`টম ব্র্যাডি - এর`)
  })
  it('should show the tracking section header', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_header')
        .first()
        .text()
    ).toEqual(`Tracking number: `)
  })
  it('should show the tracking number', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_id_viewer')
        .first()
        .text()
    ).toEqual(`UNAVAILABLE`)
  })
  it('should show the tracking section text', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_text')
        .first()
        .text()
    ).toEqual(
      `The informant will receive the tracking ID number via SMS when the application has been sent for review. `
    )
  })
  it('Should redirect the user to the homepage', async () => {
    confirmationScreenComponent
      .find('#go_to_homepage_button')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('/')
  })
})

describe('when user is in the confirmation screen page for birth registration', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '123456789123456789',
    trackingSection: true,
    eventName: REGISTRATION,
    eventType: BIRTH,
    fullNameInBn: '',
    fullNameInEng
  })
  beforeEach(async () => {
    window.location.assign = jest.fn()
    const testComponent = await createTestComponent(
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
  it('should show the submission text', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_text')
        .first()
        .text()
    ).toEqual(`birth has been registered.`)
  })
  it('should show the submission icon', () => {
    expect(
      confirmationScreenComponent.find('#success_screen_icon').hostNodes()
        .length
    ).toEqual(1)
  })
  it('should show the online submission name', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_name')
        .first()
        .text()
    ).toEqual(`Tom Brady's`)
  })
  it('should show the tracking section header', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_header')
        .first()
        .text()
    ).toEqual(`Birth Registration Number: `)
  })
  it('should show the tracking number ', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_id_viewer')
        .first()
        .text()
    ).toEqual(`123456789123456789`)
  })
  it('should show the tracking section text', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_text')
        .first()
        .text()
    ).toEqual(
      `The informant will receive this number via SMS with instructions on how and where to collect the certificate. `
    )
  })
  it('Should redirect the user to the homepage', async () => {
    confirmationScreenComponent
      .find('#go_to_homepage_button')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('/')
  })
})

describe('when user is in the confirmation screen page for birth rejection', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '123456789123456789',
    trackingSection: true,
    eventName: REJECTION,
    eventType: BIRTH,
    fullNameInBn,
    fullNameInEng
  })
  beforeEach(async () => {
    window.location.assign = jest.fn()
    const testComponent = await createTestComponent(
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
  it('should show the submission text', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_text')
        .first()
        .text()
    ).toEqual(`birth application has been rejected.`)
  })
  it('should show the submission icon', () => {
    expect(
      confirmationScreenComponent.find('#success_screen_icon').hostNodes()
        .length
    ).toEqual(1)
  })
  it('should show the online submission name', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_name')
        .first()
        .text()
    ).toEqual(`Tom Brady's`)
  })
  it('should show the tracking section header', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_header')
        .first()
        .text()
    ).toEqual(`Tracking number: `)
  })
  it('should show the tracking number ', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_id_viewer')
        .first()
        .text()
    ).toEqual(`123456789123456789`)
  })
  it('should show the tracking section text', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_text')
        .first()
        .text()
    ).toEqual(
      `The application agent will be informed about the reasons for rejection and instructed to follow up. `
    )
  })
  it('Should redirect the user to the homepage', async () => {
    confirmationScreenComponent
      .find('#go_to_homepage_button')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('/')
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
    eventType: BIRTH,
    fullNameInBn,
    fullNameInEng
  })
  beforeEach(async () => {
    window.location.assign = jest.fn()
    const testComponent = await createTestComponent(
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
  it('should show the submission text', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_text')
        .first()
        .text()
    ).toEqual(`birth certificate has been completed.`)
  })
  it('should show the submission icon', () => {
    expect(
      confirmationScreenComponent.find('#success_screen_icon').hostNodes()
        .length
    ).toEqual(1)
  })
  it('should show the online submission name', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_name')
        .first()
        .text()
    ).toEqual(`Tom Brady's`)
  })
  it('should show the tracking section header', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_header')
        .first()
        .text()
    ).toEqual(` `)
  })
  it('should show the tracking number ', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_id_viewer')
        .first()
        .text()
    ).toEqual(`103`)
  })
  it('should show the tracking section text', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_text')
        .first()
        .text()
    ).toEqual(`Certificates have been collected from your jurisdiction. `)
  })
  it('Should redirect the user to the homepage', async () => {
    confirmationScreenComponent
      .find('#go_to_homepage_button')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('/')
  })
})

describe('when user is in the confirmation screen page for birth duplication', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '123456789123456789',
    trackingSection: true,
    eventName: DUPLICATION,
    eventType: BIRTH,
    fullNameInBn,
    fullNameInEng,
    duplicateContextId: 'xesd123456fhjlsjskxc34'
  })
  beforeEach(async () => {
    // window.location.assign = jest.fn()
    const testComponent = await createTestComponent(
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
  it('should show the submission text', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_text')
        .first()
        .text()
    ).toEqual(`birth has been registered.`)
  })
  it('should show the submission icon', () => {
    expect(
      confirmationScreenComponent.find('#success_screen_icon').hostNodes()
        .length
    ).toEqual(1)
  })
  it('should show the online submission name', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_name')
        .first()
        .text()
    ).toEqual(`Tom Brady's`)
  })
  it('should show the tracking section header', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_header')
        .first()
        .text()
    ).toEqual(`Birth Registration Number: `)
  })
  it('should show the tracking number ', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_id_viewer')
        .first()
        .text()
    ).toEqual(`123456789123456789`)
  })
  it('should show the tracking section text', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_text')
        .first()
        .text()
    ).toEqual(
      `The informant will receive this number via SMS with instructions on how and where to collect the certificate. `
    )
  })
  it('Should show the user duplicate button text', async () => {
    expect(
      confirmationScreenComponent
        .find('#go_to_duplicate_button')
        .first()
        .text()
    ).toEqual(`Back to duplicate`)
  })
  it('Should redirect the user to the homepage', async () => {
    confirmationScreenComponent
      .find('#go_to_homepage_button')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('/')
  })
  it('Should redirect the user to the duplicate page', async () => {
    window.location.assign = jest.fn()
    confirmationScreenComponent
      .find('#go_to_duplicate_button')
      .hostNodes()
      .simulate('click')
    await wait()
    confirmationScreenComponent.update()
    expect(window.location.assign).toHaveBeenCalledWith(
      '/duplicates/xesd123456fhjlsjskxc34'
    )
  })
})

describe('when user is in the confirmation screen page for death declaration', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '1245LSAJD',
    trackingSection: true,
    eventName: DECLARATION,
    eventType: DEATH,
    fullNameInBn,
    fullNameInEng
  })
  beforeEach(async () => {
    window.location.assign = jest.fn()
    const testComponent = await createTestComponent(
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
  it('should show the submission text', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_text')
        .first()
        .text()
    ).toEqual(`death application has been sent for review.`)
  })
  it('should show the submission icon', () => {
    expect(
      confirmationScreenComponent.find('#success_screen_icon').hostNodes()
        .length
    ).toEqual(1)
  })
  it('should show the online submission name', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_name')
        .first()
        .text()
    ).toEqual(`Tom Brady's`)
  })
  it('should show the tracking section header', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_header')
        .first()
        .text()
    ).toEqual(`Tracking number: `)
  })
  it('should show the tracking number ', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_id_viewer')
        .first()
        .text()
    ).toEqual(`1245LSAJD`)
  })
  it('should show the tracking section text', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_text')
        .first()
        .text()
    ).toEqual(
      `The informant will receive this number via SMS, but make sure they write it down and keep it safe. They should use the number as a reference if enquiring about their registration. `
    )
  })
  it('Should redirect the user to the homepage', async () => {
    confirmationScreenComponent
      .find('#go_to_homepage_button')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('/')
  })
  it('Should redirect the user to the new application', async () => {
    confirmationScreenComponent
      .find('#go_to_new_declaration')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('/')
  })
})

describe('when user is in the confirmation screen page for death declaration in offline', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '1245LSAJD',
    trackingSection: true,
    eventName: OFFLINE,
    eventType: DEATH,
    fullNameInBn,
    fullNameInEng
  })
  beforeEach(async () => {
    window.location.assign = jest.fn()
    const testComponent = await createTestComponent(
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
  it('should show the submission text', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_text')
        .first()
        .text()
    ).toEqual(`death application will be sent when you reconnect.`)
  })
  it('should show the submission icon', () => {
    expect(
      confirmationScreenComponent.find('#success_screen_icon').hostNodes()
        .length
    ).toEqual(1)
  })
  it('should show the online submission name', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_name')
        .first()
        .text()
    ).toEqual(`Tom Brady's`)
  })
  it('should show the tracking section header', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_header')
        .first()
        .text()
    ).toEqual(`Tracking number: `)
  })
  it('should show the tracking number', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_id_viewer')
        .first()
        .text()
    ).toEqual(`1245LSAJD`)
  })
  it('should show the tracking section text', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_text')
        .first()
        .text()
    ).toEqual(
      `The informant will receive the tracking ID number via SMS when the application has been sent for review. `
    )
  })
  it('Should redirect the user to the homepage', async () => {
    confirmationScreenComponent
      .find('#go_to_homepage_button')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('/')
  })
})

describe('when user is in the confirmation screen page for death registration', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '123456789123456789',
    trackingSection: true,
    eventName: REGISTRATION,
    eventType: DEATH,
    fullNameInBn,
    fullNameInEng
  })
  beforeEach(async () => {
    window.location.assign = jest.fn()
    const testComponent = await createTestComponent(
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
  it('should show the submission text', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_text')
        .first()
        .text()
    ).toEqual(`death has been registered.`)
  })
  it('should show the submission icon', () => {
    expect(
      confirmationScreenComponent.find('#success_screen_icon').hostNodes()
        .length
    ).toEqual(1)
  })
  it('should show the online submission name', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_name')
        .first()
        .text()
    ).toEqual(`Tom Brady's`)
  })
  it('should show the tracking section header', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_header')
        .first()
        .text()
    ).toEqual(`Death Registration Number: `)
  })
  it('should show the tracking number ', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_id_viewer')
        .first()
        .text()
    ).toEqual(`123456789123456789`)
  })
  it('should show the tracking section text', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_text')
        .first()
        .text()
    ).toEqual(
      `The informant will receive this number via SMS with instructions on how and where to collect the certificate. `
    )
  })
  it('Should redirect the user to the homepage', async () => {
    confirmationScreenComponent
      .find('#go_to_homepage_button')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('/')
  })
})

describe('when user is in the confirmation screen page for death rejection', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '123456789123456789',
    trackingSection: true,
    eventName: REJECTION,
    eventType: DEATH,
    fullNameInBn,
    fullNameInEng
  })
  beforeEach(async () => {
    window.location.assign = jest.fn()
    const testComponent = await createTestComponent(
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
  it('should show the submission text', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_text')
        .first()
        .text()
    ).toEqual(`death application has been rejected.`)
  })
  it('should show the submission icon', () => {
    expect(
      confirmationScreenComponent.find('#success_screen_icon').hostNodes()
        .length
    ).toEqual(1)
  })
  it('should show the online submission name', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_name')
        .first()
        .text()
    ).toEqual(`Tom Brady's`)
  })
  it('should show the tracking section header', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_header')
        .first()
        .text()
    ).toEqual(`Tracking number: `)
  })
  it('should show the tracking number ', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_id_viewer')
        .first()
        .text()
    ).toEqual(`123456789123456789`)
  })
  it('should show the tracking section text', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_text')
        .first()
        .text()
    ).toEqual(
      `The application agent will be informed about the reasons for rejection and instructed to follow up. `
    )
  })
  it('Should redirect the user to the homepage', async () => {
    confirmationScreenComponent
      .find('#go_to_homepage_button')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('/')
  })
})

describe('when user is in the confirmation screen page for death certification', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '103',
    trackingSection: true,
    eventName: CERTIFICATION,
    eventType: DEATH,
    fullNameInBn,
    fullNameInEng
  })
  beforeEach(async () => {
    window.location.assign = jest.fn()
    const testComponent = await createTestComponent(
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
  it('should show the submission text', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_text')
        .first()
        .text()
    ).toEqual(`death certificate has been completed.`)
  })
  it('should show the submission icon', () => {
    expect(
      confirmationScreenComponent.find('#success_screen_icon').hostNodes()
        .length
    ).toEqual(1)
  })
  it('should show the online submission name', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_name')
        .first()
        .text()
    ).toEqual(`Tom Brady's`)
  })
  it('should show the tracking section header', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_header')
        .first()
        .text()
    ).toEqual(` `)
  })
  it('should show the tracking number ', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_id_viewer')
        .first()
        .text()
    ).toEqual(`103`)
  })
  it('should show the tracking section text', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_text')
        .first()
        .text()
    ).toEqual(`Certificates have been collected from your jurisdiction. `)
  })
  it('Should redirect the user to the homepage', async () => {
    confirmationScreenComponent
      .find('#go_to_homepage_button')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('/')
  })
})

describe('when user is in the confirmation screen page for death duplication', () => {
  const { store, history } = createStore()
  const mock: any = jest.fn()
  let confirmationScreenComponent: ReactWrapper<{}, {}>
  history.push('/confirm', {
    trackNumber: '123456789123456789',
    trackingSection: true,
    eventName: DUPLICATION,
    eventType: DEATH,
    fullNameInBn,
    fullNameInEng
  })
  beforeEach(async () => {
    window.location.assign = jest.fn()
    const testComponent = await createTestComponent(
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
  it('should show the submission text', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_text')
        .first()
        .text()
    ).toEqual(`death has been registered.`)
  })
  it('should show the submission icon', () => {
    expect(
      confirmationScreenComponent.find('#success_screen_icon').hostNodes()
        .length
    ).toEqual(1)
  })
  it('should show the online submission name', () => {
    expect(
      confirmationScreenComponent
        .find('#submission_name')
        .first()
        .text()
    ).toEqual(`Tom Brady's`)
  })
  it('should show the tracking section header', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_header')
        .first()
        .text()
    ).toEqual(`Death Registration Number: `)
  })
  it('should show the tracking number ', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_id_viewer')
        .first()
        .text()
    ).toEqual(`123456789123456789`)
  })
  it('should show the tracking section text', () => {
    expect(
      confirmationScreenComponent
        .find('#tracking_sec_text')
        .first()
        .text()
    ).toEqual(
      `The informant will receive this number via SMS with instructions on how and where to collect the certificate. `
    )
  })
  it('Should redirect the user to the homepage', async () => {
    confirmationScreenComponent
      .find('#go_to_homepage_button')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('/')
  })
})
