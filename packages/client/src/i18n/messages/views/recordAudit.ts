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
import { defineMessages, MessageDescriptor } from 'react-intl'

interface IRecordAuditMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  archived: MessageDescriptor
  confirmationBody: MessageDescriptor
  confirmationTitle: MessageDescriptor
  status: MessageDescriptor
  type: MessageDescriptor
  trackingId: MessageDescriptor
  dateOfBirth: MessageDescriptor
  dateOfDeath: MessageDescriptor
  placeOfBirth: MessageDescriptor
  placeOfDeath: MessageDescriptor
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
}

const messagesToDefine: IRecordAuditMessages = {
  archived: {
    id: 'recordAudit.archive.status',
    defaultMessage: 'Archived',
    description: 'Archived status'
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
  }
}
export const recordAuditMessages: IRecordAuditMessages =
  defineMessages(messagesToDefine)
