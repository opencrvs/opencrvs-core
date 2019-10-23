import { LoopReducer, Loop } from 'redux-loop'
import * as actions from '@register/i18n/actions'
import { getDefaultLanguage, getAvailableLanguages } from '@register/i18n/utils'
import * as offlineActions from '@register/offline/actions'
import { ILocation } from '@register/offline/reducer'

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

export type IntlState = {
  language: string
  messages: IntlMessages
  languages: ILanguageState
}

interface ISupportedLanguages {
  code: string
  language: string
}

const supportedLanguages: ISupportedLanguages[] = [
  { code: 'en', language: 'English' },
  { code: 'bn', language: 'বাংলা' }
]

export const initLanguages = () => {
  const initLanguages: ILanguageState = {}
  getAvailableLanguages().forEach(lang => {
    const languageDescription = supportedLanguages.find(
      obj => obj.code === lang
    ) as ISupportedLanguages
    initLanguages[lang] = {
      lang,
      displayName: languageDescription.language,
      messages: {}
    }
  })
  return initLanguages
}

const DEFAULT_MESSAGES = { default: 'default' }

export const initialState: IntlState = {
  language: getDefaultLanguage(),
  messages: DEFAULT_MESSAGES,
  languages: initLanguages()
}

export const formatLocationLanguageState = (
  locations: ILocation[],
  languages: ILanguageState
): ILanguageState => {
  const primaryLocationMessages: IntlMessages = {}
  const secondaryLocationMessages: IntlMessages = {}

  locations.forEach((location: ILocation) => {
    primaryLocationMessages[`location.${location.id}`] = location.name
    if (Object.keys(languages).length === 2) {
      secondaryLocationMessages[`location.${location.id}`] = location.alias
    }
  })
  Object.keys(languages).forEach((key, index) => {
    const language = languages[key]
    language.messages = {
      ...language.messages,
      ...(index === 1 ? secondaryLocationMessages : primaryLocationMessages)
    }
  })
  return languages
}

const getNextMessages = (
  language: string,
  languages: ILanguageState
): IntlMessages => {
  return languages[language].messages
}

export const intlReducer: LoopReducer<IntlState, any> = (
  state: IntlState = initialState,
  action: actions.Action | offlineActions.Action
): IntlState | Loop<IntlState, actions.Action | offlineActions.Action> => {
  switch (action.type) {
    case actions.CHANGE_LANGUAGE:
      const messages = getNextMessages(action.payload.language, state.languages)

      return {
        ...state,
        language: action.payload.language,
        messages
      }

    case offlineActions.READY:
      const languages = action.payload.languages

      const loadedLanguagesState: ILanguageState = languages.reduce(
        (indexedByLang, language) => ({
          ...indexedByLang,
          [language.lang]: language
        }),
        {}
      )

      const languagesWithLocations = formatLocationLanguageState(
        Object.values(action.payload.locations),
        loadedLanguagesState
      )

      const languagesWithFacilities = formatLocationLanguageState(
        Object.values(action.payload.facilities),
        languagesWithLocations
      )

      const updatedMessages = {
        ...getNextMessages(state.language, state.languages),
        ...languagesWithFacilities[state.language].messages
      }

      return {
        ...state,
        messages: updatedMessages,
        languages: languagesWithFacilities
      }
    default:
      return state
  }
}
