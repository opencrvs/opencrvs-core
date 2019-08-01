import { defineMessages } from 'react-intl'

interface IRejectMessages {
  rejectionFormTitle: ReactIntl.FormattedMessage.MessageDescriptor
  rejectionReasonSubmit: ReactIntl.FormattedMessage.MessageDescriptor
  rejectionForm: ReactIntl.FormattedMessage.MessageDescriptor
  rejectionReason: ReactIntl.FormattedMessage.MessageDescriptor
  rejectionReasonDuplicate: ReactIntl.FormattedMessage.MessageDescriptor
  rejectionReasonMisspelling: ReactIntl.FormattedMessage.MessageDescriptor
  rejectionReasonMissingSupportingDoc: ReactIntl.FormattedMessage.MessageDescriptor
  rejectionReasonOther: ReactIntl.FormattedMessage.MessageDescriptor
  rejectionCommentForHealthWorkerLabel: ReactIntl.FormattedMessage.MessageDescriptor
  rejectionFormInstruction: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IRejectMessages = {
  rejectionFormTitle: {
    id: 'review.rejection.form.title',
    defaultMessage: 'Reasons for rejection',
    description: 'Rejection form title'
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
    defaultMessage: 'Duplicate application',
    description: 'Label for rejection option duplicate'
  },
  rejectionReasonMisspelling: {
    id: 'review.rejection.form.reasons.misspelling',
    defaultMessage: 'Misspelling',
    description: 'Label for rejection option misspelling'
  },
  rejectionReasonMissingSupportingDoc: {
    id: 'review.rejection.form.reasons.missingSupportingDoc',
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
      'Comments or instructions for health worker to rectify application',
    description: 'Label for rejection comment text area'
  },
  rejectionFormInstruction: {
    id: 'review.rejection.form.commentInstruction',
    defaultMessage:
      'Please provide specific instructions of what needs to be updated by the health worker to correctly update the application',
    description: 'Label for rejection comment instruction'
  }
}

export const messages: IRejectMessages = defineMessages(messagesToDefine)
