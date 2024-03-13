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
import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import * as actions from '@login/i18n/actions'

import {
  getAvailableLanguages,
  getDefaultLanguage,
  storeLanguage
} from './utils'
import { loadContent } from '@login/utils/referenceApi'

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

export const initLanguages = () => {
  const initLanguages: ILanguageState = {}
  getAvailableLanguages().forEach((lang) => {
    initLanguages[lang] = {
      lang,
      messages: {}
    }
  })
  return initLanguages
}

export type IntlState = {
  language: string
  messages: IntlMessages
  languages: ILanguageState
}

const DEFAULT_MESSAGES = { default: 'default' }

export const initialState: IntlState = {
  language: getDefaultLanguage(),
  messages: DEFAULT_MESSAGES,
  languages: initLanguages()
}

const getNextMessages = (
  language: string,
  languages: ILanguageState
): IntlMessages => {
  if (!languages[language]) {
    return languages[getDefaultLanguage()].messages
  }
  return languages[language].messages
}

export const intlReducer: LoopReducer<IntlState, any> = (
  state: IntlState = initialState,
  action: actions.Action
): IntlState | Loop<IntlState, actions.Action> => {
  switch (action.type) {
    case actions.LOAD_LANGUAGE:
      return loop(
        state,
        Cmd.run(loadContent, {
          successActionCreator: actions.loadLanguagesSuccess
        })
      )
    case actions.LOAD_LANGUAGE_SUCCESS:
      const { languages } = action.payload

      const loadedLanguagesState: ILanguageState = languages.reduce(
        (indexedByLang, language) => ({
          ...indexedByLang,
          [language.lang]: language
        }),
        {}
      )
      return {
        ...state,
        messages: getNextMessages(state.language, loadedLanguagesState),
        languages: loadedLanguagesState
      }
    case actions.CHANGE_LANGUAGE:
      const messages = getNextMessages(action.payload.language, state.languages)
      let language = action.payload.language

      if (!state.languages[language]) {
        language = getDefaultLanguage()
      }

      return loop(
        {
          ...state,
          language,
          messages
        },
        Cmd.run(() => storeLanguage(language))
      )
    default:
      return state
  }
}
