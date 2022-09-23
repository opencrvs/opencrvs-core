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
import { storage } from '@login/storage'
import { useLocation } from 'react-router'

export function getAvailableLanguages() {
  return window.config.LANGUAGES.split(',')
}

export function getDefaultLanguage() {
  return getAvailableLanguages()[0]
}

export function storeLanguage(language: string) {
  storage.setItem('language', language)
}

export async function retrieveLanguage() {
  return (await storage.getItem('language')) || getDefaultLanguage()
}

export const useSearchQuery = (key: string) => {
  return new URLSearchParams(useLocation().search).get(key)
}
