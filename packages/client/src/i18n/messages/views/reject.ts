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
import { defineMessages, MessageDescriptor } from 'react-intl'

interface IRejectMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  rejectionFormTitle: MessageDescriptor
  rejectionReasonSubmit: MessageDescriptor
  rejectionForm: MessageDescriptor
  rejectionReason: MessageDescriptor
  rejectionReasonDuplicate: MessageDescriptor
  rejectionReasonMisspelling: MessageDescriptor
  rejectionReasonMissingSupportingDoc: MessageDescriptor
  rejectionReasonOther: MessageDescriptor
  rejectionCommentForHealthWorkerLabel: MessageDescriptor
  rejectionFormInstruction: MessageDescriptor
  markAsDuplicate: MessageDescriptor
  rejectionReasonLabel: MessageDescriptor
}

const messagesToDefine: IRejectMessages = {
  rejectionFormTitle: {
    id: 'review.rejection.form.title',
    defaultMessage: 'What update does the declaration require?',
    description: 'Rejection form title'
  },
  rejectionFormInstruction: {
    id: 'review.rejection.form.instruction',
    defaultMessage:
      'Please describe the updates required to this record for follow up action.',
    description: 'Rejection form instruction'
  },
  rejectionReasonSubmit: {
    id: 'review.rejection.form.submitButton',
    defaultMessage: 'Submit rejection',
    description: 'Rejection form submit button'
  },
  rejectionForm: {
    id: 'review.rejection.form',
    defaultMessage: 'Rejection Form',
    description: 'Rejection form name'
  },
  rejectionReason: {
    id: 'review.rejection.form.reasons',
    defaultMessage: 'Reason(s) for rejection:',
    description: 'Rejection reasons checkbox label'
  },
  rejectionReasonDuplicate: {
    id: 'review.rejection.form.reasons.duplicate',
    defaultMessage: 'Duplicate declaration',
    description: 'Label for rejection option duplicate'
  },
  markAsDuplicate: {
    id: 'review.rejection.form.reasons.markDuplicate',
    defaultMessage: 'Mark as a duplicate',
    description: 'Label for rejection option duplicate'
  },
  rejectionReasonMisspelling: {
    id: 'review.rejection.form.reasons.misspelling',
    defaultMessage: 'Misspelling',
    description: 'Label for rejection option misspelling'
  },
  rejectionReasonMissingSupportingDoc: {
    id: 'review.rej.form.reasons.missSupDoc',
    defaultMessage: 'Missing supporting documents',
    description: 'Label for rejection option missing supporting doc'
  },
  rejectionReasonOther: {
    id: 'review.rejection.form.reasons.other',
    defaultMessage: 'Other',
    description: 'Label for rejection option other'
  },
  rejectionCommentForHealthWorkerLabel: {
    id: 'review.rejection.form.commentLabel',
    defaultMessage:
      'Comments or instructions for health worker to rectify declaration'
  },
  rejectionReasonLabel: {
    id: 'review.rejection.form.reasonLabel',
    defaultMessage: 'Reason'
  }
}

export const messages: IRejectMessages = defineMessages(messagesToDefine)
