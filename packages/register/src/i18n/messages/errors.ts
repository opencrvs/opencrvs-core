import { defineMessages } from 'react-intl'

interface IErrorMessages {
  errorCodeUnauthorized: ReactIntl.FormattedMessage.MessageDescriptor
  errorTitleUnauthorized: ReactIntl.FormattedMessage.MessageDescriptor
  errorTitle: ReactIntl.FormattedMessage.MessageDescriptor
  errorDescription1: ReactIntl.FormattedMessage.MessageDescriptor
  errorDescription2: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IErrorMessages = {
  errorCodeUnauthorized: {
    id: 'error.code',
    defaultMessage: '401',
    description: 'Error code'
  },
  errorTitleUnauthorized: {
    id: 'error.title.unauthorized',
    defaultMessage: 'Unauthorized!',
    description: 'Error title unauthorized'
  },
  errorTitle: {
    id: 'error.title',
    defaultMessage: 'Whoops!',
    description: 'Error title'
  },
  errorDescription1: {
    id: 'error.somethingWentWrong',
    defaultMessage: 'Something went wrong.',
    description: 'Error description'
  },
  errorDescription2: {
    id: 'error.weAreTryingToFixThisError',
    defaultMessage: "It's not you, it us. This is our fault.",
    description: 'Error description'
  }
}

export const errorMessages: IErrorMessages = defineMessages(messagesToDefine)
