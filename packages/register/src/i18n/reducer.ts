import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import * as actions from '@register/i18n/actions'
import { ENGLISH_STATE } from '@register/i18n/locales/en'
import { BENGALI_STATE } from '@register/i18n/locales/bn'
import { getDefaultLanguage } from '@register/i18n/utils'
import * as offlineActions from '@register/offline/actions'

export interface IntlMessages {
  [key: string]: string
}

export interface ILanguage {
  lang: string
  displayName: string
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
  language: getDefaultLanguage(),
  messages: languages[getDefaultLanguage()].messages,
  languages
}

const getNextMessages = (language: string): IntlMessages => {
  return languages[language].messages
}

export const intlReducer: LoopReducer<IntlState, any> = (
  state: IntlState = initialState,
  action: any
): IntlState | Loop<IntlState, actions.Action | offlineActions.Action> => {
  switch (action.type) {
    case actions.CHANGE_LANGUAGE:
      const messages = getNextMessages(action.payload.language)
      return {
        ...state,
        language: action.payload.language,
        messages
      }
    case actions.STORE_OFFLINE_LANGUAGES:
      const offlineLanguages = action.payload as ILanguage[]
      const offlineLanguagesState: ILanguageState = {}
      offlineLanguages.forEach((language: ILanguage) => {
        offlineLanguagesState[language.lang] = language
      })
      return loop(
        {
          ...state,
          languages: offlineLanguagesState
        },
        Cmd.list([Cmd.action(offlineActions.filterLocationsByLanguage())])
      )
    case actions.STORE_LANGUAGES:
      const languagesLoaded = action.payload as ILanguage[]
      const loadedLanguagesState: ILanguageState = {}
      languagesLoaded.forEach((language: ILanguage) => {
        loadedLanguagesState[language.lang] = language
      })
      return loop(
        {
          ...state,
          languages: loadedLanguagesState
        },
        Cmd.list([Cmd.action(offlineActions.loadLocations())])
      )
    case actions.ADD_OFFLINE_KEYS:
      let updatedMessages = getNextMessages(state.language)
      updatedMessages = {
        ...updatedMessages,
        ...action.payload[state.language].messages
      }
      return {
        ...state,
        messages: updatedMessages,
        languages: action.payload
      }
    default:
      return state
  }
}
