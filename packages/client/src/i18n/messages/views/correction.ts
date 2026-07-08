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
import { defineMessages } from 'react-intl'

const messagesToDefine = {
  requestedCorrection: {
    id: 'correction.request',
    defaultMessage: 'Requested correction',
    description: 'Status for application being requested for correction'
  },
  whoRequestedCorrection: {
    id: 'correction.corrector.title',
    defaultMessage: 'Who is requesting a change to this record?',
    description: 'The title for the corrector form'
  },
  name: {
    id: 'correction.name',
    defaultMessage: 'Correction',
    description: 'Certificate correction section name'
  },
  title: {
    id: 'correction.title',
    defaultMessage: 'Correct record',
    description: 'Certificate correction section title'
  },
  groom: {
    id: 'correction.corrector.groom',
    defaultMessage: 'Groom',
    description: 'Label for groom option in certificate correction form'
  },
  child: {
    id: 'correction.corrector.child',
    defaultMessage: 'Child',
    description: 'Label for child option in certificate correction form'
  },
  anotherRegOrFieldAgent: {
    id: 'correction.corrector.anotherAgent',
    defaultMessage: 'Another registration agent or field agent',
    description:
      'Label for another registration or field agent option in certificate correction form'
  },
  me: {
    id: 'correction.corrector.me',
    defaultMessage: 'Me (Registrar)',
    description: 'Label for registrar option in certificate correction form'
  },
  others: {
    id: 'correction.corrector.others',
    defaultMessage: 'Someone else',
    description: 'Label for someone else option in certificate correction form'
  },
  whatWasTheReasonForCorrection: {
    id: 'correction.reason.title',
    defaultMessage: 'What was the reason for making a correction?',
    description: 'The title for the correction reason form'
  },
  otherReason: {
    id: 'correction.reason.other',
    defaultMessage: 'Other',
    description: 'Label for other for correction reason form'
  },
  correctionSummaryTitle: {
    id: 'correction.summary.title',
    defaultMessage: 'Correction summary',
    description: 'Title for certificate correction summary'
  },
  correctionSummaryOriginal: {
    id: 'correction.summary.original',
    defaultMessage: 'Original',
    description:
      'Original value table header for certificate correction summary'
  },
  correctionSummaryCorrection: {
    id: 'correction.summary.correction',
    defaultMessage: 'Correction',
    description:
      'Correction value table header for certificate correction summary'
  },
  correctionForApprovalDialogCancel: {
    defaultMessage: 'Cancel',
    description:
      'The cancel button for the dialog when record correction sent by registration agent for approval',
    id: 'correction.correctionForApprovalDialog.actions.cancel'
  },
  correctionForApprovalDialogConfirm: {
    defaultMessage: 'Confirm',
    description:
      'The send button for the dialog when record correction sent by registration agent for approval',
    id: 'correction.correctionForApprovalDialog.actions.send'
  },
  correctionForApprovalDialogDescription: {
    defaultMessage:
      'This will initiate a formal correction request for the selected record. Supporting documentation may be required.',
    description:
      'The description for the dialog when record correction sent by registration agent for approval',
    id: 'correction.correctionForApprovalDialog.description'
  },
  correctRecordDialogTitle: {
    id: 'correction.correctRecordDialog.title',
    defaultMessage: 'Correct record ?',
    description:
      'The title for the dialog when record correction sent by a registrar'
  },
  correctRecordDialogDescription: {
    defaultMessage:
      'Approving this correction will permanently update the official record.',
    description:
      'The description for the dialog when record correction sent by a registrar',
    id: 'correction.correctRecordDialog.description'
  },

  // V2
  correctionSectionTitle: {
    id: 'correction.summary.section.title',
    defaultMessage: 'Request correction(s)',
    description: 'Corrections section title'
  },
  makeCorrectionSectionTitle: {
    id: 'record-corrected.summary.section.title',
    defaultMessage: 'Correction(s)',
    description: 'Make corrections section title'
  },
  change: {
    id: 'correction.summary.change',
    defaultMessage: 'Change',
    description: 'Change link label'
  },
  correctionApprovalDialogTitle: {
    id: 'correction.correctionForApprovalDialog.title',
    defaultMessage: 'Request record correction?',
    description:
      'The title for the dialog when record correction sent by registration agent for approval'
  },
  verifyIdentity: {
    id: 'correction.label.verifyIdentity.confirm',
    defaultMessage: 'Yes',
    description: 'Label for verification of identity in correction request'
  },
  cancelVerifyIdentity: {
    id: 'correction.label.verifyIdentity.cancel',
    defaultMessage: 'No',
    description:
      'Label for cancellation of identity verificationin correction request'
  }
}

export const messages = defineMessages(messagesToDefine)
