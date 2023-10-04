import { ILanguage } from '@login/i18n/reducer'

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
interface Ii18n {
  language: string
}

interface ILanguageResponse {
  languages: ILanguage[]
}

export const CHANGE_LANGUAGE = 'I18N/CHANGE_LANGUAGE'
export const LOAD_LANGUAGE = 'I18N/LOAD_LANGUAGE'
export const LOAD_LANGUAGE_SUCCESS = 'I18N/LOAD_LANGUAGE_SUCCESS'

type ChangeLanguageAction = {
  type: typeof CHANGE_LANGUAGE
  payload: Ii18n
}

type LoadLanguageAction = {
  type: typeof LOAD_LANGUAGE
}

type LoadLanguageSuccessAction = {
  type: typeof LOAD_LANGUAGE_SUCCESS
  payload: ILanguageResponse
}

export type Action =
  | ChangeLanguageAction
  | LoadLanguageAction
  | LoadLanguageSuccessAction

export const loadLanguages = (): LoadLanguageAction => ({
  type: LOAD_LANGUAGE
})

export const loadLanguagesSuccess = (
  languageResponse: ILanguageResponse
): LoadLanguageSuccessAction => ({
  type: LOAD_LANGUAGE_SUCCESS,
  payload: languageResponse
})

export const changeLanguage = (values: Ii18n): ChangeLanguageAction => ({
  type: CHANGE_LANGUAGE,
  payload: values
})
