import { Ii18n } from '../type/i18n'

export const CHANGE_LANGUAGE = 'I18N/CHANGE_LANGUAGE'

export type Action = { type: typeof CHANGE_LANGUAGE; payload: Ii18n }

export const changeLanguage = (values: Ii18n): Action => ({
  type: CHANGE_LANGUAGE,
  payload: values
})
