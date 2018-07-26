import { getLanguage, getMessages } from './selectors'
import { mockState } from '../tests/util'
import * as actions from './actions'
import { intlReducer, initialState } from './reducer'
import { ENGLISH_STATE } from './locales/en'
import { BENGALI_STATE } from './locales/bn'

describe('intlSelectors', () => {
  describe('getLanguage', () => {
    it('should return language locale string', () => {
      const locale = 'en'
      expect(getLanguage(mockState)).toEqual(locale)
    })
  })
  describe('getMessages', () => {
    it('should return messages object', () => {
      const messages = ENGLISH_STATE.messages
      expect(getMessages(mockState)).toEqual(messages)
    })
  })
})

describe('intlReducer', () => {
  it('updates the state and change the language state of the application', () => {
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

describe('intlActions', () => {
  describe('changeLanguage', () => {
    it('dispatches CHANGE_LANGUAGE action', () => {
      const action = {
        type: actions.CHANGE_LANGUAGE,
        payload: { LANGUAGE: 'en' }
      }
      expect(actions.changeLanguage({ LANGUAGE: 'en' })).toEqual(action)
    })
  })
})
