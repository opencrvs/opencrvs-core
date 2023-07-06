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

import { COUNTRY_CONFIG_URL } from '@gateway/constants'

import fetch from 'node-fetch'

async function getApplicationConfig() {
  const url = new URL('application-config', COUNTRY_CONFIG_URL).toString()
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Expected to get the aplication config from ${url}`)
  }
  return res.json()
}

export async function seedApplicationConfig(token: string) {
  await getApplicationConfig()
}
