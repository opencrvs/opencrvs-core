import { LoopReducer, Loop } from 'redux-loop'
import * as actions from '@performance/i18n/actions'
import { ENGLISH_STATE } from '@performance/i18n/locales/en'
import { BENGALI_STATE } from '@performance/i18n/locales/bn'

export interface IntlMessages {
  [key: string]: string
}

export interface ILanguage {
  lang: string
  messages: IntlMessages
}

export interface ILanguageState {
  [key: string]: ILanguage
}

export const languages: ILanguageState = {
  en: ENGLISH_STATE,
  bn: BENGALI_STATE
}

export type IntlState = {
  language: string
  messages: IntlMessages
  languages: ILanguageState
}

export const initialState: IntlState = {
  language: window.config.LANGUAGE,
  messages: languages[window.config.LANGUAGE].messages,
  languages
}
const getNextMessages = (language: string): IntlMessages => {
  return languages[language].messages
}

export const intlReducer: LoopReducer<IntlState, any> = (
  state: IntlState = initialState,
  action: any
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
