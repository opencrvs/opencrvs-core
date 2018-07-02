import * as actions from './intlActions'

describe('intlActions tests', () => {
  it('changeLanguage should dispatch CHANGE_LANGUAGE action', () => {
    const action = {
      type: actions.CHANGE_LANGUAGE,
      payload: { LANGUAGE: 'en' }
    }
    expect(actions.changeLanguage({ LANGUAGE: 'en' })).toEqual(action)
  })
})
