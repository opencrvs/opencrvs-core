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
import { createStore, get, set, del } from 'idb-keyval'
import { validateApplicationVersion } from '@client/utils'

const DATABASE_NAME = 'OpenCRVS'
const STORE_NAME = 'keyvaluepairs'

/**
 * Create store when module is first loaded.
 *
 * Previously store was created on-demand, initiated at application root. (index.tsx).
 * However, files are executed during import. React renders after everything is imported.
 *
 * There is no guarantee that application root is executed before other files that might use storage (e.g. useDrafts).
 */
let store = createStore(DATABASE_NAME, STORE_NAME)

function configStorage() {
  store = createStore(DATABASE_NAME, STORE_NAME)
  validateApplicationVersion()
}

async function getItem<T = string>(key: string): Promise<T | null> {
  if (!store) {
    // eslint-disable-next-line no-console
    console.error('IDB store not initialized before getItem:', key)
    return null
  }

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
