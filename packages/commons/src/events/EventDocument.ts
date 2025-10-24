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
import { Action } from './ActionDocument'

import { UUID } from '../uuid'

export const EventDocument = z
  .object({
    id: UUID.describe('Unique identifier of the event.'),
    type: z
      .string()
      .describe('Type of the event (e.g. birth, death, marriage).'),
    createdAt: z
      .string()
      .datetime()
      .describe('Timestamp indicating when the event was created.'),
    updatedAt: z
      .string()
      .datetime()
      .describe(
        'Timestamp of the last update, excluding changes from actions.'
      ),
    actions: z
      .array(Action)
      .describe('Ordered list of actions associated with the event.'),
    trackingId: z
      .string()
      .describe(
        'System-generated tracking identifier used to look up the event.'
      )
  })
  .meta({ id: 'EventDocument' })

export type EventDocument = z.infer<typeof EventDocument>
