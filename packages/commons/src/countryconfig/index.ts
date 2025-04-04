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

import { makeApi, makeErrors, Zodios } from '@zodios/core'
import { z } from 'zod'
import { EventConfig } from 'src/events'

export const countryConfigAPI = makeApi([
  {
    method: 'get',
    path: '/events',
    alias: 'getEventConfigurations',
    description: 'Get event configurations',
    response: z.array(EventConfig),
    errors: makeErrors([])
  }
])

export function createAPIClient(url: string) {
  return new Zodios(url, countryConfigAPI, {
    axiosConfig: {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  })
}
