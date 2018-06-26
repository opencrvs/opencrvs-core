import { LoopReducer, Loop } from 'redux-loop'
import * as actions from './intlActions'
import { IntlMessages } from '../type/i18n'
import { ENGLISH_STATE } from './en'
import { BENGALI_STATE } from './bn'

export type IntlState = {
  LANGUAGE: string
  messages: IntlMessages
}

export const initialState: IntlState = {
  LANGUAGE: 'bn',
  messages: BENGALI_STATE.messages
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

export const intlReducer: LoopReducer<IntlState, actions.Action> = (
  state: IntlState = initialState,
  action: actions.Action
): IntlState | Loop<IntlState, actions.Action> => {
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
