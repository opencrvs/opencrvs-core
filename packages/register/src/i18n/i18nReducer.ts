import { LoopReducer, Loop } from 'redux-loop'
import * as actions from './i18nActions'
import { IntlMessages } from '../type/i18n'
import { ENGLISH_STATE } from './en'
import { BENGALI_STATE } from './bn'

export type I18nState = {
  LANGUAGE: string
  messages: IntlMessages
}

export const initialState: I18nState = {
  LANGUAGE: 'en',
  messages: ENGLISH_STATE.messages
}

const getNextMessages = (language: string): IntlMessages => {
  switch (language) {
    case 'en':
      return ENGLISH_STATE.messages
    case 'bn':
      return BENGALI_STATE.messages
    default:
      return ENGLISH_STATE.messages
  }
}

export const i18nReducer: LoopReducer<I18nState, actions.Action> = (
  state: I18nState = initialState,
  action: actions.Action
): I18nState | Loop<I18nState, actions.Action> => {
  switch (action.type) {
    case actions.CHANGE_LANGUAGE:
      const messages = getNextMessages(action.payload.LANGUAGE)

      return {
        ...state,
        LANGUAGE: action.payload.LANGUAGE,
        messages
      }
    default:
      return state
  }
}
