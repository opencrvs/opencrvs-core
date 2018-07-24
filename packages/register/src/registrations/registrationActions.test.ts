import * as actions from './registrationActions'

describe('registrationActions tests', () => {
  it('startRegistration should pass form params to dispatch START_SEND_REGISTRATION_DATA action', () => {
    const action = {
      type: actions.START_SEND_REGISTRATION_DATA,
      payload: {
        firstName: 'Euan'
      }
    }
    expect(actions.startRegistration({ firstName: 'Euan' })).toEqual(action)
  })
})
