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
import { createStore, get, set, del, UseStore } from 'idb-keyval'
import { validateApplicationVersion } from '@client/utils'

let store: UseStore | undefined
function configStorage(dbName: string) {
  store = createStore(dbName, 'keyvaluepairs')

  validateApplicationVersion()
}

async function getItem<T = string>(key: string): Promise<T | null> {
  return (await get<T>(key, store)) || null
}

async function setItem<T = string>(key: string, value: T) {
  return await set(key, value, store)
}

async function removeItem(key: string) {
  return await del(key, store)
}

export const storage = {
  configStorage,
  getItem,
  setItem,
  removeItem
}
