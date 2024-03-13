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
import { IntlState } from '@client/i18n/reducer'
import { IStoreState } from '@client/store'

const getPartialState = (store: IStoreState): IntlState => store.i18n

function getKey<K extends keyof IntlState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getLanguage = (store: IStoreState): IntlState['language'] =>
  getKey(store, 'language')

export const getLanguages = (store: IStoreState): IntlState['languages'] =>
  getKey(store, 'languages')

export const getMessages = (store: IStoreState): IntlState['messages'] =>
  getKey(store, 'messages')
