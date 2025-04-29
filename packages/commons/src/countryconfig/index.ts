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
import { ActionInput, ActionTypes, EventConfig, EventDocument } from '../events'

export const countryConfigAPI = makeApi([
  {
    method: 'get',
    path: '/events',
    alias: 'getEventConfigurations',
    tags: ['Events'],
    description: 'Get event configurations',
    response: z.array(EventConfig),
    errors: makeErrors([])
  },
  {
    method: 'post',
    path: '/events/:eventType/actions/:actionType',
    alias: 'actionEventTrigger',
    tags: ['Events'],
    description: 'Receive a notification of an action',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z
          .object({
            actionId: z.string(),
            event: EventDocument,
            action: ActionInput
          })
          .openapi({ ref: 'a', description: 'moi' })
      },
      {
        name: 'eventType',
        type: 'Path',
        schema: z.string().openapi({ ref: 'b', description: 'moi' })
      },
      {
        name: 'actionType',
        type: 'Path',
        schema: ActionTypes.openapi({ ref: 'c', description: 'moi' })
      }
    ],
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
