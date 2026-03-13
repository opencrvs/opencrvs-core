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

/**
 * Shared response summary shape for operations that return an event document.
 */
type EventResponseSummary = {
  eventId: string
  eventType: string
  trackingId: string
}

export type EventCreateAuditLog = {
  operation: 'event.create'
  requestData: {
    transactionId: string
    type: string
    createdAtLocation: string | null
  }
  responseSummary: EventResponseSummary
}

export type EventGetAuditLog = {
  operation: 'event.get'
  requestData: {
    eventId: string
  }
  responseSummary: EventResponseSummary
}

export type EventSearchAuditLog = {
  operation: 'event.search'
  requestData: {
    query: Record<string, unknown> | null
    limit: number | null
    offset: number | null
  }
  responseSummary: {
    total: number
    eventIds: string[]
  }
}

type ActionAuditLogRequestData = {
  eventId: string
  actionType: string
  transactionId: string
}

export type EventNotifyAuditLog = {
  operation: 'event.actions.notify.request'
  requestData: ActionAuditLogRequestData
  responseSummary: EventResponseSummary
}

export type EventCorrectionRequestAuditLog = {
  operation: 'event.actions.correction.request.request'
  requestData: ActionAuditLogRequestData
  responseSummary: EventResponseSummary
}

export type EventCorrectionApproveAuditLog = {
  operation: 'event.actions.correction.approve.request'
  requestData: ActionAuditLogRequestData
  responseSummary: EventResponseSummary
}

export type EventCorrectionRejectAuditLog = {
  operation: 'event.actions.correction.reject.request'
  requestData: ActionAuditLogRequestData
  responseSummary: EventResponseSummary
}

/**
 * All event action audit log variants share the same requestData and responseSummary shapes.
 * Defined as a single type with a union operation field so call sites can pass a
 * union-typed operation string without needing a type cast.
 */
export type EventActionAuditLog = {
  operation:
    | EventNotifyAuditLog['operation']
    | EventCorrectionRequestAuditLog['operation']
    | EventCorrectionApproveAuditLog['operation']
    | EventCorrectionRejectAuditLog['operation']
  requestData: ActionAuditLogRequestData
  responseSummary: EventResponseSummary
}

export type IntegrationCreateAuditLog = {
  operation: 'integrations.create'
  requestData: {
    name: string
    scopes: string[]
  }
  responseSummary: {
    clientId: string
  }
}

export type AttachmentUploadAuditLog = {
  operation: 'attachments.upload'
  requestData: {
    transactionId: string
    path: string | null
  }
  responseSummary: {
    fileUrl: string
  }
}

export const UserAuditRecordInput = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('user.CREATE_USER'),
    requestData: z.object({
      subjectId: z.string(),
      role: z.string(),
      primaryOfficeId: z.string()
    }),
    responseSummary: z.object({})
  }),
  z.object({
    operation: z.literal('user.DEACTIVATE'),
    requestData: z.object({
      subjectId: z.string(),
      reason: z.string(),
      comment: z.string().optional()
    }),
    responseSummary: z.object({})
  }),
  z.object({
    operation: z.literal('user.REACTIVATE'),
    requestData: z.object({
      subjectId: z.string(),
      reason: z.string(),
      comment: z.string().optional()
    }),
    responseSummary: z.object({})
  }),
  z.object({
    operation: z.literal('user.EDIT_USER'),
    requestData: z.object({ subjectId: z.string() }),
    responseSummary: z.object({})
  }),
  z.object({
    operation: z.literal('user.EMAIL_ADDRESS_CHANGED'),
    requestData: z.object({ subjectId: z.string() }),
    responseSummary: z.object({ email: z.string() })
  }),
  z.object({
    operation: z.literal('user.LOGGED_IN'),
    requestData: z.object({ subjectId: z.string() }),
    responseSummary: z.object({})
  }),
  z.object({
    operation: z.literal('user.LOGGED_OUT'),
    requestData: z.object({ subjectId: z.string() }),
    responseSummary: z.object({})
  }),
  z.object({
    operation: z.literal('user.PASSWORD_CHANGED'),
    requestData: z.object({ subjectId: z.string() }),
    responseSummary: z.object({})
  }),
  z.object({
    operation: z.literal('user.PASSWORD_RESET'),
    requestData: z.object({ subjectId: z.string() }),
    responseSummary: z.object({})
  }),
  z.object({
    operation: z.literal('user.PASSWORD_RESET_BY_ADMIN'),
    requestData: z.object({ subjectId: z.string() }),
    responseSummary: z.object({})
  }),
  z.object({
    operation: z.literal('user.PHONE_NUMBER_CHANGED'),
    requestData: z.object({ subjectId: z.string() }),
    responseSummary: z.object({ phoneNumber: z.string() })
  }),
  z.object({
    operation: z.literal('user.USERNAME_REMINDER'),
    requestData: z.object({ subjectId: z.string() }),
    responseSummary: z.object({})
  }),
  z.object({
    operation: z.literal('user.USERNAME_REMINDER_BY_ADMIN'),
    requestData: z.object({ subjectId: z.string() }),
    responseSummary: z.object({})
  })
])

export type UserAuditLog = z.infer<typeof UserAuditRecordInput>

/**
 * Union of all audit log entry variants.
 * Each variant narrows the `operation`, `requestData`, and `responseSummary` fields together.
 * Event action operations are grouped into a single `EventActionAuditLog` type since they
 * share identical requestData and responseSummary shapes.
 */
export type AuditLogOperation =
  | EventCreateAuditLog
  | EventGetAuditLog
  | EventSearchAuditLog
  | EventActionAuditLog
  | IntegrationCreateAuditLog
  | AttachmentUploadAuditLog
  | UserAuditLog

/**
 * Parameters for writing an audit log entry.
 * All fields must be supplied explicitly by the caller — do not pass JWT or context objects.
 */
export type AuditLogParams = AuditLogOperation & {
  clientId: string
  clientType: TokenUserType
}
