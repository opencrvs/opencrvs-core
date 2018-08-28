import * as actions from './i18nActions'
import { i18nReducer, initialState } from './i18nReducer'
import { BENGALI_STATE } from './bn'

describe('intlReducer tests', () => {
  it('should update the state and change the language state of the application', () => {
    const expectedState = {
      ...initialState,
      LANGUAGE: BENGALI_STATE.lang,
      messages: BENGALI_STATE.messages
    }
    const action = {
      type: actions.CHANGE_LANGUAGE,
      payload: { LANGUAGE: 'bn' }
    }
    const returnedState = i18nReducer(expectedState, action)
    expect(returnedState).toEqual(expectedState)
  })
})
