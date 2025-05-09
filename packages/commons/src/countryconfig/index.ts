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

import { z } from 'zod'
import { ActionInput, ActionTypes, EventConfig, EventDocument } from '../events'
import { ZodOpenApiPathsObject } from 'zod-openapi'

export const countryConfigApi: ZodOpenApiPathsObject = {
  '/events': {
    get: {
      tags: ['Events'],
      description: 'Get event configurations',
      responses: {
        '200': {
          description: '200 OK',
          content: {
            'application/json': {
              schema: z.array(EventConfig)
            }
          }
        }
      }
    }
  },
  '/events/{eventType}/actions/{actionType}': {
    post: {
      tags: ['Events'],
      description: 'Receive a notification of an action',
      responses: {
        '200': {
          description: '200 OK',
          content: {
            'application/json': {
              schema: EventDocument
            }
          }
        }
      },
      requestParams: {
        path: z.object({
          eventType: z.string(),
          actionType: ActionTypes
        })
      },
      requestBody: {
        content: {
          'application/json': {
            schema: z.object({
              actionId: z.string(),
              event: EventDocument,
              action: ActionInput
            })
          }
        }
      }
    }
  }
}
