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
import { ActionStatus, PotentialDuplicate } from './ActionDocument'
import { UUID } from '../uuid'
import { CreatedAtLocation } from './CreatedAtLocation'

/**
 * Event statuses recognized by the system
 */
export const EventStatus = z.enum([
  'CREATED',
  'NOTIFIED',
  'DECLARED',
  'VALIDATED',
  'REGISTERED',
  'ARCHIVED'
])

export type EventStatus = z.infer<typeof EventStatus>

export const InherentFlags = {
  PENDING_CERTIFICATION: 'pending-certification',
  INCOMPLETE: 'incomplete',
  REJECTED: 'rejected',
  CORRECTION_REQUESTED: 'correction-requested',
  POTENTIAL_DUPLICATE: 'potential-duplicate'
} as const

export type InherentFlags = (typeof InherentFlags)[keyof typeof InherentFlags]

export const ActionFlag = z
  .string()
  .regex(
    new RegExp(
      `^(${Object.values(ActionType).join('|').toLowerCase()}):(${Object.values(
        ActionStatus
      )
        .join('|')
        .toLowerCase()})$`
    ),
    'Flag must be in the format ActionType:ActionStatus (lowerCase)'
  )
export const Flag = ActionFlag.or(z.nativeEnum(InherentFlags))

export type ActionFlag = z.infer<typeof ActionFlag>
export type Flag = z.infer<typeof Flag>

export const ZodDate = z.string().date()

export const ActionCreationMetadata = z.object({
  createdAt: z
    .string()
    .datetime()
    .describe('The timestamp when the action request was created.'),
  createdBy: z
    .string()
    .describe('ID of the user who created the action request.'),
  createdAtLocation: CreatedAtLocation.describe(
    'Location of the user who created the action request.'
  ),
  createdByUserType: z
    .enum(['user', 'system'])
    .nullish()
    .describe('Whether the user is a normal user or a system.'),
  acceptedAt: z
    .string()
    .datetime()
    .describe('Timestamp when the action request was accepted.'),
  createdByRole: z
    .string()
    .describe('Role of the user at the time of action request creation.'),
  createdBySignature: z
    .string()
    .nullish()
    .describe('Signature of the user who created the action request.')
})

export type ActionCreationMetadata = z.infer<typeof ActionCreationMetadata>

export const RegistrationCreationMetadata = ActionCreationMetadata.extend({
  registrationNumber: z
    .string()
    .describe(
      'Registration number of the event. Always present for accepted registrations.'
    )
})

export type RegistrationCreationMetadata = z.infer<
  typeof RegistrationCreationMetadata
>

// @TODO: In the future REVOKE should be added to the list of statuses
export const LegalStatuses = z.object({
  [EventStatus.enum.DECLARED]: ActionCreationMetadata.nullish(),
  [EventStatus.enum.REGISTERED]: RegistrationCreationMetadata.nullish()
})

/**
 * Event metadata exposed to client.
 *
 * Accessed through `event.` in configuration.
 */
export const EventMetadata = z.object({
  id: UUID,
  type: z
    .string()
    .describe('The type of event, such as birth, death, or marriage.'),
  status: EventStatus,
  legalStatuses: LegalStatuses.describe(
    'Metadata related to the legal registration of the event, such as who registered it and when.'
  ),
  createdAt: z
    .string()
    .datetime()
    .describe('The timestamp when the event was first created and saved.'),
  dateOfEvent: ZodDate.nullish(),
  createdBy: z.string().describe('ID of the user who created the event.'),
  createdByUserType: z
    .enum(['user', 'system'])
    .nullish()
    .describe('Whether the user is a normal user or a system.'),
  updatedByUserRole: z
    .string()
    .describe('Role of the user who last changed the status.'),
  createdAtLocation: CreatedAtLocation.describe(
    'Location of the user who created the event.'
  ),
  createdBySignature: z
    .string()
    .nullish()
    .describe('Signature of the user who created the event.'),
  updatedAtLocation: UUID.nullish().describe(
    'Location of the user who last changed the status.'
  ),
  updatedAt: z
    .string()
    .datetime()
    .describe(
      'Timestamp of the most recent *accepted* status change. Possibly 3rd party update, if action is validation asynchronously.'
    ),
  assignedTo: z
    .string()
    .nullish()
    .describe('ID of the user currently assigned to the event.'),
  updatedBy: z
    .string()
    .nullish()
    .describe('ID of the user who last changed the status.'),
  trackingId: z
    .string()
    .describe(
      'System-generated tracking ID used by informants or registrars to look up the event.'
    ),
  duplicates: z
    .array(PotentialDuplicate)
    .describe(
      'List of event IDs and their tracking IDs that this event could be a duplicate of.'
    ),
  flags: z.array(Flag)
})

export type EventMetadata = z.infer<typeof EventMetadata>

export const EventMetadataKeysArray = [
  'id',
  'type',
  'status',
  'createdAt',
  'dateOfEvent',
  'createdBy',
  'createdByUserType',
  'updatedByUserRole',
  'createdAtLocation',
  'updatedAtLocation',
  'updatedAt',
  'assignedTo',
  'updatedBy',
  'trackingId',
  'legalStatuses',
  'flags'
] as const

export const EventMetadataKeys = z.enum(EventMetadataKeysArray)
export type EventMetadataKeys = z.infer<typeof EventMetadataKeys>

/**
 * Mapping of event metadata keys to translation configuration.
 * Consider introducing type in same manner as we have in FieldConfig.
 * We need a way to know how to parse it.
 */
export const eventMetadataLabelMap: Record<
  Exclude<`event.${EventMetadataKeys}`, 'event.legalStatuses'>,
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
  'event.createdByUserType': {
    id: 'event.createdByUserType.label',
    defaultMessage: 'createdByUserType',
    description: 'createdByUserType:user or system'
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
  'event.flags': {
    id: 'event.flags.label',
    defaultMessage: 'Flags',
    description: 'Flags'
  }
}
