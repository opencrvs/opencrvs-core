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
import * as actions from '@client/i18n/actions'
import {
  getAvailableLanguages,
  getDefaultLanguage,
  storeLanguage
} from '@client/i18n/utils'
import * as offlineActions from '@client/offline/actions'
import { ILocation } from '@client/offline/reducer'
import {
  IRoleLoadedAction,
  IRoleMessagesLoadedAction
} from '@client/user/userReducer'
import { Cmd, Loop, LoopReducer, loop } from 'redux-loop'

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

export type IntlState = {
  language: string
  messages: IntlMessages
  languages: ILanguageState
}

const initLanguages = () => {
  const initLanguages: ILanguageState = {}
  getAvailableLanguages().forEach((lang) => {
    initLanguages[lang] = {
      lang,
      messages: {}
    }
  })
  return initLanguages
}

const DEFAULT_MESSAGES = { default: 'default' }

const initialState: IntlState = {
  language: getDefaultLanguage(),
  messages: DEFAULT_MESSAGES,
  languages: initLanguages()
}

const formatLocationLanguageState = (
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
  if (!languages[language]) {
    return languages[getDefaultLanguage()].messages
  }
  return languages[language].messages
}

export const intlReducer: LoopReducer<IntlState, any> = (
  state: IntlState = initialState,
  action: actions.Action | offlineActions.Action | IRoleLoadedAction
):
  | IntlState
  | Loop<
      IntlState,
      actions.Action | offlineActions.Action | IRoleMessagesLoadedAction
    > => {
  switch (action.type) {
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

    case offlineActions.READY:
    case offlineActions.UPDATED:
      const languages = action.payload.languages
      const loadedLanguagesState: ILanguageState = languages.reduce(
        (indexedByLang, language) => ({
          ...indexedByLang,
          [language.lang]: {
            ...language,
            messages: {
              ...state.languages[language.lang].messages,
              ...language.messages
            }
          }
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
