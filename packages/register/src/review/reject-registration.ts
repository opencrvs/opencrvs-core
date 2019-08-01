import { CHECKBOX_GROUP, TEXTAREA, IFormField } from '@register/forms'
import { messages } from '@register/i18n/messages/views/reject'

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
