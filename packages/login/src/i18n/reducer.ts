/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import * as actions from '@login/i18n/actions'
import { ENGLISH_STATE } from '@login/i18n/locales/en'
import { BENGALI_STATE } from '@login/i18n/locales/bn'
import {
  getAvailableLanguages,
  getDefaultLanguage,
  storeLanguage
} from './utils'

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
  languages: getAvailableLanguages().reduce(
    (accumulatedValues, language) => ({
      ...accumulatedValues,
      [language]: languages[language]
    }),
    {}
  )
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

      return loop(
        {
          ...state,
          language: action.payload.language,
          messages
        },
        Cmd.run(() => storeLanguage(action.payload.language))
      )
    default:
      return state
  }
}
