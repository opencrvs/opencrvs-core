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

/**
 * Event statuses recognized by the system
 */
export const EventStatus = {
  CREATED: 'CREATED',
  NOTIFIED: 'NOTIFIED',
  DECLARED: 'DECLARED',
  REGISTERED: 'REGISTERED',
  CERTIFIED: 'CERTIFIED'
} as const
export const eventStatuses = Object.values(EventStatus)
export type EventStatus = (typeof eventStatuses)[number]

export const EventStatuses = z.nativeEnum(EventStatus)

export const EventIndex = z.object({
  id: z.string(),
  type: z.string(),
  status: EventStatuses,
  createdAt: z.string().datetime(),
  createdBy: z.string(),
  createdAtLocation: z.string(),
  modifiedAt: z.string().datetime(),
  assignedTo: z.string().nullable(),
  updatedBy: z.string(),
  data: z.record(z.string(), z.unknown())
})

export type EventIndex = z.infer<typeof EventIndex>
export const EventIndices = z.array(EventIndex)
