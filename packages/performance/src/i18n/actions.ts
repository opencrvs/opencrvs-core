interface Ii18n {
  language: string
}

export const CHANGE_LANGUAGE = 'I18N/CHANGE_LANGUAGE'

type ChangeLanguageAction = {
  type: typeof CHANGE_LANGUAGE
  payload: Ii18n
}

export type Action = ChangeLanguageAction

export const changeLanguage = (values: Ii18n): ChangeLanguageAction => ({
  type: CHANGE_LANGUAGE,
  payload: values
})
