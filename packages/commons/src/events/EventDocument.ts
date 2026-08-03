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

import * as z from 'zod/v4'
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
    configVersion: z
      .string()
      .optional()
      .describe(
        'The form config version this event is pinned to, recorded at creation ' +
          'time. The permanent audit trail (which legal form version governs ' +
          'this record) and the resolution key for rendering/validating it — ' +
          'never changed by ordinary corrections. Optional so events created ' +
          'before this field existed continue to parse unchanged; resolution ' +
          'falls back to the version active on `createdAt` for those.'
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
