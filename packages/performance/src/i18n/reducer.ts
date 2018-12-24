import { LoopReducer, Loop } from 'redux-loop'
import * as actions from './actions'
import { ENGLISH_STATE } from './locales/en'
import { BENGALI_STATE } from './locales/bn'
import { config } from 'src/config'

export interface IntlMessages {
  [key: string]: string
}

export const languages = {
  en: ENGLISH_STATE,
  bn: BENGALI_STATE
}

export type IntlState = {
  language: string
  messages: IntlMessages
  languages: typeof languages
}

export const initialState: IntlState = {
  language: config.LANGUAGE,
  messages: languages[config.LANGUAGE].messages,
  languages
}

const getNextMessages = (language: string): IntlMessages => {
  return languages[language].messages
}

export const intlReducer: LoopReducer<IntlState, actions.Action> = (
  state: IntlState = initialState,
  action: actions.Action
): IntlState | Loop<IntlState, actions.Action> => {
  switch (action.type) {
    case actions.CHANGE_LANGUAGE:
      const messages = getNextMessages(action.payload.language)

      return {
        ...state,
        language: action.payload.language,
        messages
      }
    default:
      return state
  }
}
