import { ILanguageState } from '@register/i18n/reducer'

interface Ii18n {
  language: string
}

export const CHANGE_LANGUAGE = 'I18N/CHANGE_LANGUAGE'
export const ADD_OFFLINE_KEYS = 'I18N/ADD_OFFLINE_KEYS'

type ChangeLanguageAction = {
  type: typeof CHANGE_LANGUAGE
  payload: Ii18n
}

type AddOfflineDataAction = {
  type: typeof ADD_OFFLINE_KEYS
  payload: ILanguageState
}

export type Action = ChangeLanguageAction | AddOfflineDataAction

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
