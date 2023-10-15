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
const store: Record<string, string | null> = {}

function getItem(key: string): string | null {
  return store[key]
}

function setItem(key: string, value: string) {
  store[key] = value
  return value
}

async function removeItem(key: string) {
  store[key] = null
}

export const storage = {
  getItem,
  setItem,
  removeItem
}
