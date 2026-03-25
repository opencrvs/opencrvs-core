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

export type IntegrationRefreshTokenAuditLog = {
  operation: 'integrations.refreshToken'
  requestData: {
    clientId: string
  }
  responseSummary: {
    clientId: string
  }
}

export type IntegrationDeactivateAuditLog = {
  operation: 'integrations.deactivate'
  requestData: {
    id: string
  }
  responseSummary: {
    id: string
    status: string
  }
}

export type IntegrationActivateAuditLog = {
  operation: 'integrations.activate'
  requestData: {
    id: string
  }
  responseSummary: {
    id: string
    status: string
  }
}

export type IntegrationDeleteAuditLog = {
  operation: 'integrations.delete'
  requestData: {
    id: string
  }
  responseSummary: {
    id: string
    name: string
  }
}

export type IntegrationRefreshSecretAuditLog = {
  operation: 'integrations.refreshSecret'
  requestData: {
    id: string
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
  | IntegrationDeactivateAuditLog
  | IntegrationActivateAuditLog
  | IntegrationDeleteAuditLog
  | IntegrationRefreshSecretAuditLog
  | AttachmentUploadAuditLog
  | IntegrationCreateAuditLog
  | IntegrationRefreshTokenAuditLog
  | IntegrationDeactivateAuditLog
  | IntegrationActivateAuditLog
  | IntegrationDeleteAuditLog

/**
 * Parameters for writing an audit log entry.
 * All fields must be supplied explicitly by the caller — do not pass JWT or context objects.
 */
export type AuditLogParams = AuditLogOperation & {
  clientId: string
  clientType: TokenUserType
}
