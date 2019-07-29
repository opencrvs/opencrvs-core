import { defineMessages } from 'react-intl'

interface IErrorMessages {
  errorCodeUnauthorized: ReactIntl.FormattedMessage.MessageDescriptor
  errorTitleUnauthorized: ReactIntl.FormattedMessage.MessageDescriptor
  errorTitle: ReactIntl.FormattedMessage.MessageDescriptor
  errorDescription1: ReactIntl.FormattedMessage.MessageDescriptor
  errorDescription2: ReactIntl.FormattedMessage.MessageDescriptor
  queryError: ReactIntl.FormattedMessage.MessageDescriptor
  duplicateQueryError: ReactIntl.FormattedMessage.MessageDescriptor
  fieldAgentQueryError: ReactIntl.FormattedMessage.MessageDescriptor
  draftFailed: ReactIntl.FormattedMessage.MessageDescriptor
  printQueryError: ReactIntl.FormattedMessage.MessageDescriptor
  registrationQueryError: ReactIntl.FormattedMessage.MessageDescriptor
  unauthorized: ReactIntl.FormattedMessage.MessageDescriptor
  userQueryError: ReactIntl.FormattedMessage.MessageDescriptor
  pleaseTryAgainError: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IErrorMessages = {
  pleaseTryAgainError: {
    id: 'error.occured',
    defaultMessage: 'An error occured. Please try again.',
    description:
      'The error message that displays if we wnat the user to try the action again'
  },
  userQueryError: {
    id: 'system.user.queryError',
    defaultMessage: 'An error occured while loading system users',
    description: 'The text when error ocurred loading system users'
  },
  registrationQueryError: {
    id: 'review.birthRegistration.queryError',
    defaultMessage: 'An error occurred while fetching birth registration',
    description: 'The error message shown when a query fails'
  },
  unauthorized: {
    id: 'review.error.unauthorized',
    defaultMessage: 'We are unable to display this page to you',
    description: 'The error message shown when a query fails'
  },
  printQueryError: {
    id: 'print.certificate.queryError',
    defaultMessage:
      'An error occurred while quering for birth registration data',
    description: 'The error message shown when a query fails'
  },
  draftFailed: {
    id: 'error.draftFailed',
    defaultMessage:
      'This is some messaging on advicing the user on what to do... in the event of a failed applicaton.',
    description: 'Tips for failed applications'
  },
  fieldAgentQueryError: {
    id: 'fieldAgentHome.queryError',
    defaultMessage: 'An error occured while loading applications',
    description: 'The text when error ocurred loading rejected applications'
  },
  queryError: {
    id: 'error.search',
    defaultMessage: 'An error occurred while searching',
    description: 'The error message shown when a search query fails'
  },
  duplicateQueryError: {
    id: 'duplicates.queryError',
    defaultMessage: 'An error occurred while fetching data',
    description: 'The error message shown when a search query fails'
  },
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
