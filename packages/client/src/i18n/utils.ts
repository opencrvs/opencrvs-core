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
import * as queryString from 'querystring'
import { storage } from '@client/storage'

export function getAvailableLanguages() {
  return window.config.LANGUAGES.split(',')
}

export function getDefaultLanguage() {
  return getAvailableLanguages()[0]
}

export async function getPreferredLanguage() {
  const languageInUrl = queryString.parse(
    window.location.search.replace(/^\?/, '')
  ).language as string | undefined

  const alreadyStoredLanguage = await storage.getItem('language')

  if (languageInUrl) {
    return languageInUrl
  } else if (alreadyStoredLanguage) {
    return alreadyStoredLanguage
  } else {
    return getDefaultLanguage()
  }
}

export function storeLanguage(language: string) {
  storage.setItem('language', language)
}
