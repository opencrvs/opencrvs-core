import { ILanguage } from '@register/i18n/reducer'

interface Ii18n {
  language: string
}

export const CHANGE_LANGUAGE = 'I18N/CHANGE_LANGUAGE'

export const STORE_LANGUAGES = 'I18N/STORE_LANGUAGES'

type ChangeLanguageAction = {
  type: typeof CHANGE_LANGUAGE
  payload: Ii18n
}

type StoreLanguagesAction = {
  type: typeof STORE_LANGUAGES
  payload: ILanguage[]
}

export type Action = ChangeLanguageAction | StoreLanguagesAction

export const changeLanguage = (values: Ii18n): ChangeLanguageAction => ({
  type: CHANGE_LANGUAGE,
  payload: values
})

export const storeLanguages = (
  languages: ILanguage[]
): StoreLanguagesAction => ({
  type: STORE_LANGUAGES,
  payload: languages
})
