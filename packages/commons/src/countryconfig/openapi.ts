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

import { OpenApiBuilder } from '@zodios/openapi'
import * as yaml from 'yaml'
import { countryConfigAPI } from '.'
import _ = require('lodash')

const openapi = new OpenApiBuilder({
  title: 'Countryconfig implementation requirements',
  version: '1.8.0',
  description: 'Country specific configuration server for OpenCRVS'
})
  .addPublicApi(countryConfigAPI)
  /*
   * This just overrides the build-in tag logic of zodios-openapi
   */
  .setCustomTagsFn(
    (api) => countryConfigAPI.find((a) => a.path === api)?.tags || []
  )

  .build()

// eslint-disable-next-line no-console
console.log(yaml.stringify(deepDropNulls(openapi)))

function deepDropNulls<T extends Record<string, any>>(obj: T): T {
  if (!_.isObject(obj)) {
    return obj
  }

  return Object.entries(obj).reduce((acc: T, [key, value]) => {
    if (_.isObject(value)) {
      value = deepDropNulls(value)
    }

    if (value !== null) {
      return {
        ...acc,
        [key]: value
      }
    }

    return acc
  }, {} as T)
}
