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
import * as localForage from 'localforage'
import { validateApplicationVersion } from '@client/utils'

function configStorage(dbName: string) {
  localForage.config({
    driver: localForage.INDEXEDDB,
    name: dbName
  })
  validateApplicationVersion()
}

async function getItem(key: string): Promise<string | null> {
  return await localForage.getItem<string>(key)
}

async function setItem(key: string, value: string) {
  return await localForage.setItem(key, value)
}

async function removeItem(key: string) {
  return await localForage.removeItem(key)
}

export const storage = {
  configStorage,
  getItem,
  setItem,
  removeItem
}
