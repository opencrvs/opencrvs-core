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
import { TranslationConfig } from './TranslationConfig'
import { ActionType } from './ActionType'
import { ActionStatus } from './ActionDocument'

/**
 * Event statuses recognized by the system
 */
export const EventStatus = {
  CREATED: 'CREATED',
  NOTIFIED: 'NOTIFIED',
  DECLARED: 'DECLARED',
  VALIDATED: 'VALIDATED',
  REGISTERED: 'REGISTERED',
  CERTIFIED: 'CERTIFIED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED'
} as const
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus]

export const Flag = z
  .string()
  .regex(
    new RegExp(
      `^(${Object.values(ActionType).join('|')}):(${Object.values(ActionStatus).join('|')})$`
    ),
    'Flag must be in the format ActionType:ActionStatus'
  )
export type Flag = z.infer<typeof Flag>

export const eventStatuses = Object.values(EventStatus)
export const EventStatuses = z.nativeEnum(EventStatus)

export const ZodDate = z.string().date()

/**
 * Event metadata exposed to client.
 *
 * Accessed through `event.` in configuration.
 */
export const EventMetadata = z.object({
  id: z.string(),
  type: z.string(),
  status: EventStatuses,
  createdAt: z.string().datetime(),
  dateOfEvent: ZodDate.nullish(),
  createdBy: z.string(),
  updatedByUserRole: z.string(),
  createdAtLocation: z.string(),
  updatedAtLocation: z.string(),
  updatedAt: z.string().datetime(),
  assignedTo: z.string().nullish(),
  updatedBy: z.string(),
  trackingId: z.string(),
  registrationNumber: z.string().nullish(),
  flags: z.array(Flag)
})

export type EventMetadata = z.infer<typeof EventMetadata>

export type EventMetadataKeys = `event.${keyof EventMetadata}`

/**
 * Mapping of event metadata keys to translation configuration.
 * Consider introducing type in same manner as we have in FieldConfig.
 * We need a way to know how to parse it.
 */
export const eventMetadataLabelMap: Record<
  EventMetadataKeys,
  TranslationConfig
> = {
  'event.assignedTo': {
    id: 'event.assignedTo.label',
    defaultMessage: 'Assigned To',
    description: 'Assigned To'
  },
  'event.createdAt': {
    id: 'event.createdAt.label',
    defaultMessage: 'Created',
    description: 'Created At'
  },
  'event.dateOfEvent': {
    id: 'event.dateOfEvent.label',
    defaultMessage: 'Date of Event',
    description: 'Date of Event'
  },
  'event.createdAtLocation': {
    id: 'event.createdAtLocation.label',
    defaultMessage: 'Location',
    description: 'Created At Location'
  },
  'event.updatedAtLocation': {
    id: 'event.updatedAtLocation.label',
    defaultMessage: 'Location',
    description: 'Updated At Location'
  },
  'event.createdBy': {
    id: 'event.createdBy.label',
    defaultMessage: 'Created By',
    description: 'Created By'
  },
  'event.updatedByUserRole': {
    id: 'event.updatedByUserRole.label',
    defaultMessage: 'Updated By Role',
    description: 'Updated By Role'
  },
  'event.id': {
    id: 'event.id.label',
    defaultMessage: 'ID',
    description: 'ID'
  },
  'event.updatedAt': {
    id: 'event.modifiedAt.label',
    defaultMessage: 'Updated',
    description: 'Modified At'
  },
  'event.status': {
    id: 'event.status.label',
    defaultMessage: 'Status',
    description: 'Status'
  },
  'event.type': {
    id: 'event.type.label',
    defaultMessage: 'Type',
    description: 'Type'
  },
  'event.updatedBy': {
    id: 'event.updatedBy.label',
    defaultMessage: 'Updated By',
    description: 'Updated By'
  },
  'event.trackingId': {
    id: 'event.trackingId.label',
    defaultMessage: 'Tracking ID',
    description: 'Tracking ID'
  },
  'event.registrationNumber': {
    id: 'event.registrationNumber.label',
    defaultMessage: 'Registration Number',
    description: 'Registration Number'
  },
  'event.flags': {
    id: 'event.flags.label',
    defaultMessage: 'Flags',
    description: 'Flags'
  }
}
