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
import { TokenUserType } from '../authentication'
import { ActionType } from './ActionType'

const AuditLogEntryBase = z.object({
  id: z.string(),
  clientId: z.string(),
  clientType: TokenUserType,
  createdAt: z.string()
})

const EventCreateEntrySchema = AuditLogEntryBase.extend({
  operation: z.literal('event.create'),
  requestData: z.object({
    transactionId: z.string(),
    type: z.string(),
    createdAtLocation: z.string().nullable()
  }),
  responseSummary: z.object({
    eventId: z.string(),
    trackingId: z.string()
  })
})

const EventGetEntrySchema = AuditLogEntryBase.extend({
  operation: z.literal('event.get'),
  requestData: z.object({ eventId: z.string() }),
  responseSummary: z.object({
    eventType: z.string(),
    trackingId: z.string()
  })
})

const EventSearchEntrySchema = AuditLogEntryBase.extend({
  operation: z.literal('event.search'),
  clientType: z.literal('system'),
  requestData: z.object({
    query: z.record(z.string(), z.unknown()).nullable(),
    limit: z.number().nullable(),
    offset: z.number().nullable()
  }),
  responseSummary: z.object({
    total: z.number(),
    eventIds: z.array(z.string())
  })
})

// ── Event actions (all share the same requestData / responseSummary shape) ─────

const EventActionEntrySchema = AuditLogEntryBase.extend({
  operation: z.enum([
    'event.actions.notify.request',
    'event.actions.declare.request',
    'event.actions.register.request',
    'event.actions.reject.request',
    'event.actions.validate.request',
    'event.actions.edit.request',
    'event.actions.assign.request',
    'event.actions.unassign.request',
    'event.actions.read.request',
    'event.actions.archive.request',
    'event.actions.reinstate.request',
    'event.actions.print_certificate.request',
    'event.actions.correction.request.request',
    'event.actions.correction.approve.request',
    'event.actions.correction.reject.request',
    'event.actions.mark_as_duplicate.request',
    'event.actions.mark_as_not_duplicate.request'
  ]),
  requestData: z.object({
    eventId: z.string(),
    actionType: z.string(),
    eventType: z.string(),
    trackingId: z.string(),
    transactionId: z.string()
  })
})

const EventCustomActionEntrySchema = AuditLogEntryBase.extend({
  operation: z.literal('event.actions.custom.request'),
  requestData: z.object({
    eventId: z.string(),
    actionType: z.literal(ActionType.CUSTOM),
    customAction: z.string(),
    eventType: z.string(),
    trackingId: z.string(),
    transactionId: z.string()
  })
})

// ── Integrations ───────────────────────────────────────────────────────────────

const IntegrationCreateEntrySchema = AuditLogEntryBase.extend({
  operation: z.literal('integrations.create'),
  requestData: z.object({ name: z.string(), scopes: z.array(z.string()) }),
  responseSummary: z.object({ clientId: z.string() })
})

const IntegrationRefreshTokenEntrySchema = AuditLogEntryBase.extend({
  operation: z.literal('integrations.refreshToken'),
  requestData: z.object({ clientId: z.string() }),
  responseSummary: z.object({ clientId: z.string() })
})

const IntegrationDeactivateEntrySchema = AuditLogEntryBase.extend({
  operation: z.literal('integrations.deactivate'),
  requestData: z.object({ id: z.string() }),
  responseSummary: z.object({ id: z.string(), status: z.string() })
})

const IntegrationActivateEntrySchema = AuditLogEntryBase.extend({
  operation: z.literal('integrations.activate'),
  requestData: z.object({ id: z.string() }),
  responseSummary: z.object({ id: z.string(), status: z.string() })
})

const IntegrationDeleteEntrySchema = AuditLogEntryBase.extend({
  operation: z.literal('integrations.delete'),
  requestData: z.object({ id: z.string() }),
  responseSummary: z.object({ id: z.string(), name: z.string() })
})

const IntegrationRefreshSecretEntrySchema = AuditLogEntryBase.extend({
  operation: z.literal('integrations.refreshSecret'),
  requestData: z.object({ id: z.string() }),
  responseSummary: z.object({ clientId: z.string() })
})

// ── Attachments ────────────────────────────────────────────────────────────────

const AttachmentUploadEntrySchema = AuditLogEntryBase.extend({
  operation: z.literal('attachments.upload'),
  requestData: z.object({
    transactionId: z.string(),
    path: z.string().nullable()
  }),
  responseSummary: z.object({ fileUrl: z.string() })
})

// ── User operations ────────────────────────────────────────────────────────────

const subjectOnly = z.object({ subjectId: z.string() })
const subjectWithReason = z.object({
  subjectId: z.string(),
  reason: z.string(),
  comment: z.string().optional()
})

const UserCreateEntrySchema = AuditLogEntryBase.extend({
  operation: z.literal('user.create_user'),
  requestData: z.object({
    subjectId: z.string(),
    role: z.string(),
    primaryOfficeId: z.string()
  })
})
const UserReasonEntrySchema = AuditLogEntryBase.extend({
  operation: z.enum(['user.deactivate', 'user.reactivate']),
  requestData: subjectWithReason
})
const UserSubjectOnlyEntrySchema = AuditLogEntryBase.extend({
  operation: z.enum([
    'user.edit_user',
    'user.logged_in',
    'user.logged_out',
    'user.password_changed',
    'user.password_reset',
    'user.password_reset_by_admin',
    'user.username_reminder',
    'user.username_reminder_by_admin'
  ]),
  requestData: subjectOnly
})
const UserEmailChangedEntrySchema = AuditLogEntryBase.extend({
  operation: z.literal('user.email_address_changed'),
  requestData: subjectOnly,
  responseSummary: z.object({ email: z.string() })
})
const UserPhoneChangedEntrySchema = AuditLogEntryBase.extend({
  operation: z.literal('user.phone_number_changed'),
  requestData: subjectOnly,
  responseSummary: z.object({ phoneNumber: z.string() })
})

const userBaseOmit = {
  id: true,
  clientId: true,
  clientType: true,
  createdAt: true
} as const

/** Write-side schema for the user audit record mutation (no DB-generated fields). */
export const UserAuditRecordInput = z.discriminatedUnion('operation', [
  UserCreateEntrySchema.omit(userBaseOmit),
  UserReasonEntrySchema.omit(userBaseOmit),
  UserSubjectOnlyEntrySchema.omit(userBaseOmit),
  UserEmailChangedEntrySchema.omit(userBaseOmit),
  UserPhoneChangedEntrySchema.omit(userBaseOmit)
])

export type UserAuditLog = z.infer<typeof UserAuditRecordInput>

// ── Full AuditLogEntrySchema ───────────────────────────────────────────────────

export const AuditLogEntrySchema = z.discriminatedUnion('operation', [
  EventCreateEntrySchema,
  EventGetEntrySchema,
  EventSearchEntrySchema,
  EventActionEntrySchema,
  EventCustomActionEntrySchema,
  IntegrationCreateEntrySchema,
  IntegrationRefreshTokenEntrySchema,
  IntegrationDeactivateEntrySchema,
  IntegrationActivateEntrySchema,
  IntegrationDeleteEntrySchema,
  IntegrationRefreshSecretEntrySchema,
  AttachmentUploadEntrySchema,
  UserCreateEntrySchema,
  UserReasonEntrySchema,
  UserSubjectOnlyEntrySchema,
  UserEmailChangedEntrySchema,
  UserPhoneChangedEntrySchema
])

// ── Inferred types ─────────────────────────────────────────────────────────────

/** A persisted audit log entry as returned from the database. */
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>

/** Distributes Omit over a union so each variant is narrowed correctly. */
type DistributiveOmit<T, K extends string> = T extends unknown
  ? Omit<T, K>
  : never

/** Parameters for writing an audit log entry. All fields must be supplied
 *  explicitly by the caller — do not pass JWT or context objects. */
export type AuditLogParams = DistributiveOmit<AuditLogEntry, 'id' | 'createdAt'>

/** Union of all operation shapes (without auth or meta fields). */
export type AuditLogOperation = DistributiveOmit<
  AuditLogParams,
  'clientId' | 'clientType'
>

/** Event action entries that carry a full event response summary. */
export type EventActionAuditLog = z.infer<typeof EventActionEntrySchema>

/** Custom action entry — operation carries a `customAction` identifier. */
export type EventCustomActionAuditLog = Extract<
  AuditLogEntry,
  { operation: 'event.actions.custom.request' }
>

export type EventCreateAuditLog = Extract<
  AuditLogEntry,
  { operation: 'event.create' }
>
export type EventGetAuditLog = Extract<
  AuditLogEntry,
  { operation: 'event.get' }
>
export type EventSearchAuditLog = Extract<
  AuditLogEntry,
  { operation: 'event.search' }
>
