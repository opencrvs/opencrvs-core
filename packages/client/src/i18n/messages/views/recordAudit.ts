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
import { RegAction, RegStatus } from '@client/utils/gateway'
import { defineMessages, MessageDescriptor } from 'react-intl'

interface IRecordAuditMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  confirmationBody: MessageDescriptor
  status: MessageDescriptor
  type: MessageDescriptor
  trackingId: MessageDescriptor
  dateOfBirth: MessageDescriptor
  dateOfMarriage: MessageDescriptor
  placeOfBirth: MessageDescriptor
  noName: MessageDescriptor
  markAsDuplicate: MessageDescriptor
}

const messagesToDefine: IRecordAuditMessages = {
  contact: {
    id: 'recordAudit.contact',
    defaultMessage: 'Contact',
    description: 'Contact for record audit'
  },
  confirmationBody: {
    id: 'recordAudit.archive.confirmation.body',
    defaultMessage:
      'This will remove the declaration from the workqueue and change the status to Archive. To revert this change you will need to search for the declaration.',
    description: 'Confirmation body for archiving a declaration'
  },
  status: {
    id: 'recordAudit.status',
    defaultMessage: 'Status',
    description: 'Label for status'
  },
  type: {
    id: 'recordAudit.type',
    defaultMessage: 'Event',
    description: 'Label for event type'
  },
  trackingId: {
    id: 'recordAudit.trackingId',
    defaultMessage: 'Tracking ID',
    description: 'Label for tracking id'
  },
  dateOfBirth: {
    id: 'recordAudit.dateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for date of birth'
  },
  dateOfMarriage: {
    id: 'recordAudit.dateOfMarriage',
    defaultMessage: 'Date of marriage',
    description: 'Label for date of marriage'
  },
  placeOfBirth: {
    id: 'recordAudit.placeOfBirth',
    defaultMessage: 'Place of birth',
    description: 'Label for place of birth'
  },
  noName: {
    id: 'recordAudit.noName',
    defaultMessage: 'No name provided',
    description: 'Label for name not available'
  },
  markAsDuplicate: {
    id: 'recordAudit.declaration.markAsDuplicate',
    defaultMessage: 'Marked as a duplicate'
  }
}

const actionMessagesToDefine: Record<RegAction, MessageDescriptor> = {
  MARKED_AS_DUPLICATE: {
    id: 'recordAudit.regAction.markedAsDuplicate',
    defaultMessage: 'Marked as a duplicate',
    description: 'Marked as a duplicate status message for record audit'
  },
  MARKED_AS_NOT_DUPLICATE: {
    id: 'recordAudit.regAction.markedAsNotDuplicate',
    defaultMessage: 'Marked not a duplicate',
    description: 'Marked not a duplicate status message for record audit'
  },
  FLAGGED_AS_POTENTIAL_DUPLICATE: {
    id: 'recordAudit.regAction.flaggedAsPotentialDuplicate',
    defaultMessage: 'Flagged as potential duplicate',
    description:
      'Flagged as potential duplicate status message for record audit'
  },
  [RegAction.Downloaded]: {
    id: 'recordAudit.regAction.downloaded',
    defaultMessage: 'Retrieved',
    description: 'Retrieved action'
  },
  [RegAction.Assigned]: {
    id: 'recordAudit.regAction.assigned',
    defaultMessage: 'Assigned',
    description: 'Assigned action'
  },
  [RegAction.Verified]: {
    id: 'recordAudit.regAction.verified',
    defaultMessage: 'Certificate verified',
    description: 'Verified action'
  },
  [RegAction.Unassigned]: {
    id: 'recordAudit.regAction.unassigned',
    defaultMessage: 'Unassigned',
    description: 'Unassigned action'
  },
  [RegAction.Reinstated]: {
    id: 'recordAudit.regAction.reinstated',
    defaultMessage:
      'Reinstated to {regStatus, select, registered{registered} validated{ready for review} in_progress{in progress} declared{ready for review} rejected{requires updates} other{}}',
    description: 'Reinstated action'
  },
  [RegAction.RequestedCorrection]: {
    id: 'recordAudit.regAction.requestedCorrection',
    defaultMessage: 'Correction requested',
    description: 'Requested Correction action'
  },
  [RegAction.ApprovedCorrection]: {
    id: 'recordAudit.regAction.approvedCorrection',
    defaultMessage: 'Correction approved',
    description: 'Approved Correction action'
  },
  [RegAction.Corrected]: {
    id: 'recordAudit.regAction.corrected',
    defaultMessage: 'Record corrected',
    description: 'Corrected action'
  },
  [RegAction.RejectedCorrection]: {
    id: 'recordAudit.regAction.rejectedCorrection',
    defaultMessage: 'Correction rejected',
    description: 'Rejected Correction action'
  },
  [RegAction.Viewed]: {
    id: 'recordAudit.regAction.viewed',
    defaultMessage: 'Viewed',
    description: 'Viewed Record action'
  },
}

const regStatusMessagesToDefine: Record<RegStatus, MessageDescriptor> = {
  [RegStatus.Archived]: {
    defaultMessage: 'Archived',
    description: 'Label for registration status archived',
    id: 'recordAudit.regStatus.archived'
  },
  [RegStatus.InProgress]: {
    defaultMessage: 'Sent incomplete',
    description: 'Declaration submitted without completing the required fields',
    id: 'constants.sent_incomplete'
  },
  [RegStatus.Declared]: {
    defaultMessage: 'Declaration started',
    description: 'Label for registration status declared',
    id: 'recordAudit.regStatus.declared'
  },
  [RegStatus.WaitingValidation]: {
    defaultMessage: 'Waiting for validation',
    description: 'Label for registration status waitingValidation',
    id: 'recordAudit.regStatus.waitingValidation'
  },
  [RegStatus.Validated]: {
    defaultMessage: 'Sent for approval',
    description: 'The title of sent for approvals tab',
    id: 'regHome.sentForApprovals'
  },
  [RegStatus.Registered]: {
    defaultMessage: 'Registered',
    description: 'Label for registration status registered',
    id: 'recordAudit.regStatus.registered'
  },
  [RegStatus.Certified]: {
    defaultMessage: 'Certified',
    description: 'Label for registration status certified',
    id: 'recordAudit.regStatus.certified'
  },
  [RegStatus.Issued]: {
    defaultMessage: 'Issued',
    description: 'Label for registration status Issued',
    id: 'recordAudit.regStatus.issued'
  },
  [RegStatus.Rejected]: {
    defaultMessage: 'Rejected',
    description: 'A label for registration status rejected',
    id: 'recordAudit.regStatus.rejected'
  },
  [RegStatus.DeclarationUpdated]: {
    defaultMessage: 'Updated',
    description: 'Declaration has been updated',
    id: 'recordAudit.regStatus.updatedDeclaration'
  },
  [RegStatus.CorrectionRequested]: {
    defaultMessage: 'Correction requested',
    description: 'Label for when someone requested correction',
    id: 'recordAudit.regStatus.correctionRequested'
  }
}

export const recordAuditMessages: IRecordAuditMessages =
  defineMessages(messagesToDefine)
