/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { RegAction, RegStatus } from '@client/utils/gateway'
import { defineMessages, MessageDescriptor } from 'react-intl'

interface IRecordAuditMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  archived: MessageDescriptor
  sentNotification: MessageDescriptor
  started: MessageDescriptor
  confirmationBody: MessageDescriptor
  confirmationTitle: MessageDescriptor
  status: MessageDescriptor
  type: MessageDescriptor
  trackingId: MessageDescriptor
  dateOfBirth: MessageDescriptor
  dateOfDeath: MessageDescriptor
  dateOfMarriage: MessageDescriptor
  placeOfBirth: MessageDescriptor
  placeOfDeath: MessageDescriptor
  placeOfMarriage: MessageDescriptor
  informant: MessageDescriptor
  brn: MessageDescriptor
  drn: MessageDescriptor
  noName: MessageDescriptor
  noStatus: MessageDescriptor
  noType: MessageDescriptor
  noTrackingId: MessageDescriptor
  noDateOfBirth: MessageDescriptor
  noDateOfDeath: MessageDescriptor
  noPlaceOfBirth: MessageDescriptor
  noPlaceOfDeath: MessageDescriptor
  noInformant: MessageDescriptor
  reinstateDeclarationDialogTitle: MessageDescriptor
  reinstateDeclarationDialogCancel: MessageDescriptor
  reinstateDeclarationDialogConfirm: MessageDescriptor
  reinstateDeclarationDialogDescription: MessageDescriptor
  markAsDuplicate: MessageDescriptor
}

const messagesToDefine: IRecordAuditMessages = {
  archived: {
    id: 'recordAudit.archive.status',
    defaultMessage: 'Archived',
    description: 'Archived status'
  },
  sentNotification: {
    id: 'recordAudit.regStatus.declared.sentNotification',
    defaultMessage: 'Sent notification for review',
    description: 'Field agent sent notification'
  },
  started: {
    id: 'recordAudit.history.started',
    defaultMessage: 'Started',
    description: 'Declaration Started'
  },
  confirmationBody: {
    id: 'recordAudit.archive.confirmation.body',
    defaultMessage:
      'This will remove the declaration from the workqueue and change the status to Archive. To revert this change you will need to search for the declaration.',
    description: 'Confirmation body for archiving a declaration'
  },
  confirmationTitle: {
    id: 'recordAudit.archive.confirmation.title',
    defaultMessage: 'Archive declaration?',
    description: 'Confirmation title for archiving a declaration'
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
  dateOfDeath: {
    id: 'recordAudit.dateOfDeath',
    defaultMessage: 'Date of death',
    description: 'Label for date of death'
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
  placeOfDeath: {
    id: 'recordAudit.placeOfDeath',
    defaultMessage: 'Place of death',
    description: 'Label for place of death'
  },
  placeOfMarriage: {
    id: 'recordAudit.placeOfMarriage',
    defaultMessage: 'Place of marriage',
    description: 'Label for place of marriage'
  },
  informant: {
    id: 'recordAudit.informant',
    defaultMessage: 'Informant',
    description: 'Label for informant'
  },
  brn: {
    id: 'recordAudit.brn',
    defaultMessage: 'BRN',
    description: 'Label for Birth Registration Number'
  },
  drn: {
    id: 'recordAudit.drn',
    defaultMessage: 'DRN',
    description: 'Label for Death Registration Number'
  },
  registrationNo: {
    id: 'recordAudit.registrationNo',
    defaultMessage: 'Registration No',
    description: 'Label for Event Registration Number'
  },
  noStatus: {
    id: 'recordAudit.noStatus',
    defaultMessage: 'No status',
    description: 'Label for status not available'
  },
  noName: {
    id: 'recordAudit.noName',
    defaultMessage: 'No name provided',
    description: 'Label for name not available'
  },
  noType: {
    id: 'recordAudit.noType',
    defaultMessage: 'No event',
    description: 'Label for type of event not available'
  },
  noTrackingId: {
    id: 'recordAudit.noTrackingId',
    defaultMessage: 'No tracking id',
    description: 'Label for tracking id not available'
  },
  noDateOfBirth: {
    id: 'recordAudit.noDateOfBirth',
    defaultMessage: 'No date of birth',
    description: 'Label for date of birth not available'
  },
  noDateOfDeath: {
    id: 'recordAudit.noDateOfDeath',
    defaultMessage: 'No date of death',
    description: 'Label for date of death not available'
  },
  noPlaceOfBirth: {
    id: 'recordAudit.noPlaceOfBirth',
    defaultMessage: 'No place of birth',
    description: 'Label for place of birth not available'
  },
  noPlaceOfDeath: {
    id: 'recordAudit.noPlaceOfDeath',
    defaultMessage: 'No place of death',
    description: 'Label for place of death not availale'
  },
  noInformant: {
    id: 'recordAudit.noInformant',
    defaultMessage: 'No Informant',
    description: 'Label for informant not available'
  },
  reinstateDeclarationDialogTitle: {
    id: 'recordAudit.declaration.reinstateDialogTitle',
    defaultMessage: 'Reinstate declaration?',
    description: 'Title for the dialog when reinstate declaration'
  },
  reinstateDeclarationDialogCancel: {
    id: 'recordAudit.declaration.reinstateDialog.actions.cancel',
    defaultMessage: 'Cancel',
    description: 'Button label for the dialog when cancel reinstate declaration'
  },
  reinstateDeclarationDialogConfirm: {
    id: 'recordAudit.declaration.reinstateDialog.actions.confirm',
    defaultMessage: 'Confirm',
    description:
      'Button label for the dialog when confirm reinstate declaration'
  },
  reinstateDeclarationDialogDescription: {
    id: 'recordAudit.declaration.reinstateDialogDescription',
    defaultMessage:
      'This will revert the application back to its original status and add it to your workqueue.',
    description: 'Description for the dialog when reinstate declaration'
  },
  markAsDuplicate: {
    id: 'recordAudit.declaration.markAsDuplicate',
    defaultMessage: 'Marked as a duplicate'
  }
}

const actionMessagesToDefine: Record<RegAction, MessageDescriptor> = {
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
      'Reinstated to {regStatus, select, validated{ready for review} in_progress{in progress} declared{ready for review} rejected{requires updates} other{}}',
    description: 'Reinstated action'
  },
  [RegAction.RequestedCorrection]: {
    id: 'recordAudit.regAction.requestedCorrection',
    defaultMessage: 'Requested Correction',
    description: 'Requested Correction action'
  },
  [RegAction.Viewed]: {
    id: 'recordAudit.regAction.viewed',
    defaultMessage: 'Viewed',
    description: 'Viewed Record action'
  },
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
  }
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
  }
}

export const recordAuditMessages: IRecordAuditMessages =
  defineMessages(messagesToDefine)

export const regActionMessages: Record<RegAction, MessageDescriptor> =
  defineMessages(actionMessagesToDefine)

export const regStatusMessages: Record<RegStatus, MessageDescriptor> =
  defineMessages(regStatusMessagesToDefine)
