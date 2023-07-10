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

import { COUNTRY_CONFIG_URL, CONFIG_MONGO_URL } from '@gateway/constants'
import * as mongoose from 'mongoose'
import Config, {
  IApplicationConfigurationModel
} from '@gateway/features/application/model/config'

import fetch from 'node-fetch'

async function getApplicationConfig() {
  const url = new URL('application-config', COUNTRY_CONFIG_URL).toString()
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Expected to get the aplication config from ${url}`)
  }
  return res.json()
}

async function populateAppConfig(appConfig: IApplicationConfigurationModel) {
  mongoose.connect(CONFIG_MONGO_URL)

  try {
    const defaultConfig = new Config(appConfig)
    const configs = [defaultConfig]
    const onInsert = (err: any, values: any) => {
      if (!err) {
        mongoose.disconnect()
      } else {
        throw Error(
          `Cannot save ${JSON.stringify(
            values
          )} to declaration config db ... ${err}`
        )
      }
    }
    Config.collection.insertMany(configs, onInsert)
  } catch (err) {
    throw new Error(err)
  }
  return true
}

export async function seedApplicationConfig() {
  const appConfig = await getApplicationConfig()
  populateAppConfig(appConfig)
}
