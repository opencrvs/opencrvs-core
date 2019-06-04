import { defineMessages } from 'react-intl'
import { CHECKBOX_GROUP, TEXTAREA, IFormField } from '@register/forms'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
})

export interface IRejectRegistrationForm {
  fields: IFormField[]
}
export const rejectRegistration: IRejectRegistrationForm = {
  fields: [
    {
      name: 'rejectionReason',
      type: CHECKBOX_GROUP,
      label: messages.rejectionReason,
      required: true,
      initialValue: [],
      validate: [],
      options: [
        {
          value: 'duplicate',
          label: messages.rejectionReasonDuplicate
        },
        {
          value: 'misspelling',
          label: messages.rejectionReasonMisspelling
        },
        {
          value: 'missing_supporting_doc',
          label: messages.rejectionReasonMissingSupportingDoc
        },
        {
          value: 'other',
          label: messages.rejectionReasonOther
        }
      ]
    },
    {
      name: 'rejectionCommentForHealthWorker',
      type: TEXTAREA,
      label: messages.rejectionCommentForHealthWorkerLabel,
      initialValue: '',
      validate: [],
      required: true,
      description: messages.rejectionFormInstruction
    }
  ]
}
