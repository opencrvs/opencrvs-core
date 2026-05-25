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
import { storage } from '@login/storage'
import { useLocation } from 'react-router-dom'

export function getAvailableLanguages() {
  // 2.0 countryconfig returns LANGUAGES as string[], 1.9 returned a comma-separated string.
  // Handle both so this code works during the upgrade window when the old SW bundle
  // runs against a new 2.0 countryconfig.
  const languages = window.config.LANGUAGES
  return Array.isArray(languages) ? languages : languages.split(',')
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
