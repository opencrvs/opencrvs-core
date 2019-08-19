import { ILanguageState, ILanguage } from '@register/i18n/reducer'

interface Ii18n {
  language: string
}

export const CHANGE_LANGUAGE = 'I18N/CHANGE_LANGUAGE'
export const ADD_OFFLINE_KEYS = 'I18N/ADD_OFFLINE_KEYS'
export const STORE_LANGUAGES = 'I18N/STORE_LANGUAGES'
export const STORE_OFFLINE_LANGUAGES = 'I18N/STORE_OFFLINE_LANGUAGES'

type ChangeLanguageAction = {
  type: typeof CHANGE_LANGUAGE
  payload: Ii18n
}

type AddOfflineDataAction = {
  type: typeof ADD_OFFLINE_KEYS
  payload: ILanguageState
}

type StoreOfflineLanguagesAction = {
  type: typeof STORE_OFFLINE_LANGUAGES
  payload: ILanguage[]
}

type StoreLanguagesAction = {
  type: typeof STORE_LANGUAGES
  payload: ILanguage[]
}

export type Action =
  | ChangeLanguageAction
  | AddOfflineDataAction
  | StoreOfflineLanguagesAction
  | StoreLanguagesAction

export const changeLanguage = (values: Ii18n): ChangeLanguageAction => ({
  type: CHANGE_LANGUAGE,
  payload: values
})

export const addOfflineData = (
  payload: ILanguageState
): AddOfflineDataAction => ({
  type: ADD_OFFLINE_KEYS,
  payload
})

export const storeOfflineLanguages = (
  languages: ILanguage[]
): StoreOfflineLanguagesAction => ({
  type: STORE_OFFLINE_LANGUAGES,
  payload: languages
})

export const storeLanguages = (
  languages: ILanguage[]
): StoreLanguagesAction => ({
  type: STORE_LANGUAGES,
  payload: languages
})
