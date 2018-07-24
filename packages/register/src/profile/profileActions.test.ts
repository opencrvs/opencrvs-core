import * as actions from './profileActions'

describe('profileActions tests', () => {
  it('checkAuth should pass URL params to dispatch CHECK_AUTH action', () => {
    const action = {
      type: actions.CHECK_AUTH,
      payload: {
        token: '123456'
      }
    }
    expect(actions.checkAuth({ token: '123456' })).toEqual(action)
  })
})
