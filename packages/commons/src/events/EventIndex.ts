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
import { EventMetadata } from './EventMetadata'
import { FieldValue } from './FieldValue'

export const EventIndex = EventMetadata.extend({
  data: z.record(z.string(), FieldValue)
})

export const EventSearchIndex = z.record(z.string(), FieldValue).and(
  z.object({
    type: z.string() // Ensures "type" (event-id) exists and is a string
  })
)

export type EventSearchIndex = z.infer<typeof EventSearchIndex>
export type EventIndex = z.infer<typeof EventIndex>
