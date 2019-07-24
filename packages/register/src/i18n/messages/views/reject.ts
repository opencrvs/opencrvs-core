import { defineMessages } from 'react-intl'

interface IRejectMessages {
  rejectionFormTitle: ReactIntl.FormattedMessage.MessageDescriptor
  rejectionReasonSubmit: ReactIntl.FormattedMessage.MessageDescriptor
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
  }
}

export const messages: IRejectMessages = defineMessages(messagesToDefine)
