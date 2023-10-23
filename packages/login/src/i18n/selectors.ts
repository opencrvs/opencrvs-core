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
import { IntlState } from '@login/i18n/reducer'
import { IStoreState } from '@login/store'

const getPartialState = (store: IStoreState): IntlState => store.i18n

function getKey<K extends keyof IntlState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getLanguages = (store: IStoreState): IntlState['languages'] =>
  getKey(store, 'languages')

export const getLanguage = (store: IStoreState): IntlState['language'] =>
  getKey(store, 'language')

export const getMessages = (store: IStoreState): IntlState['messages'] =>
  getKey(store, 'messages')
