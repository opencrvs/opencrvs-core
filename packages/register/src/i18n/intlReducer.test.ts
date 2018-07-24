import * as actions from './intlActions'
import { intlReducer, initialState } from './intlReducer'
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
    const returnedState = intlReducer(expectedState, action)
    expect(returnedState).toEqual(expectedState)
  })
})
