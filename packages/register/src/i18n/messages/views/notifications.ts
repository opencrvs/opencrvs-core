import { defineMessages } from 'react-intl'

interface INotificationsMessages {
  newContentAvailable: ReactIntl.FormattedMessage.MessageDescriptor
  declarationsSynced: ReactIntl.FormattedMessage.MessageDescriptor
  draftsSaved: ReactIntl.FormattedMessage.MessageDescriptor
  userFormSuccess: ReactIntl.FormattedMessage.MessageDescriptor
  userFormFail: ReactIntl.FormattedMessage.MessageDescriptor
  processingText: ReactIntl.FormattedMessage.MessageDescriptor
  outboxText: ReactIntl.FormattedMessage.MessageDescriptor
  statusWaitingToRegister: ReactIntl.FormattedMessage.MessageDescriptor
  statusWaitingToReject: ReactIntl.FormattedMessage.MessageDescriptor
  statusWaitingToSubmit: ReactIntl.FormattedMessage.MessageDescriptor
  statusRegistering: ReactIntl.FormattedMessage.MessageDescriptor
  statusRejecting: ReactIntl.FormattedMessage.MessageDescriptor
  statusSubmitting: ReactIntl.FormattedMessage.MessageDescriptor
  waitingToRetry: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: INotificationsMessages = {
  statusWaitingToRegister: {
    id: 'register.registrationHome.outbox.statusWaitingToRegister',
    defaultMessage: 'Waiting to register',
    description: 'Label for application status waiting for register'
  },
  statusWaitingToReject: {
    id: 'register.registrationHome.outbox.statusWaitingToReject',
    defaultMessage: 'Waiting to reject',
    description: 'Label for application status waiting for reject'
  },
  statusWaitingToSubmit: {
    id: 'register.registrationHome.outbox.statusWaitingToSubmit',
    defaultMessage: 'Waiting to submit',
    description: 'Label for application status waiting for reject'
  },
  statusRegistering: {
    id: 'register.registrationHome.outbox.statusRegistering',
    defaultMessage: 'Registering...',
    description: 'Label for application status Registering'
  },
  statusRejecting: {
    id: 'register.registrationHome.outbox.statusRejecting',
    defaultMessage: 'Rejecting...',
    description: 'Label for application status Rejecting'
  },
  statusSubmitting: {
    id: 'register.registrationHome.outbox.statusSubmitting',
    defaultMessage: 'Submitting...',
    description: 'Label for application status submitting'
  },
  waitingToRetry: {
    id: 'register.registrationHome.outbox.waitingToRetry',
    defaultMessage: 'Waiting to retry',
    description: 'Label for application status waiting for connection'
  },
  processingText: {
    id: 'notification.processingText',
    defaultMessage: '{num} application processing...',
    description: 'Application processing text'
  },
  outboxText: {
    id: 'notification.outboxText',
    defaultMessage: 'Outbox({num})',
    description: 'Application outbox text'
  },
  newContentAvailable: {
    id: 'notification.newContentAvailable',
    defaultMessage: "We've made some updates, click here to refresh.",
    description:
      'The message that appears in notification when new content available.'
  },
  declarationsSynced: {
    id: 'notification.declarationsSynced',
    defaultMessage:
      'As you have connectivity, we have synced {syncCount} new birth declarations.',
    description:
      'The message that appears in notification when background sync takes place'
  },
  draftsSaved: {
    id: 'notification.draftsSaved',
    defaultMessage: 'Your draft has been saved',
    description:
      'The message that appears in notification when save drafts button is clicked'
  },
  userFormSuccess: {
    id: 'notification.userFormSuccess',
    defaultMessage: 'New user created',
    description:
      'The message that appears in notification when a new user is created'
  },
  userFormFail: {
    id: 'notification.sorryError',
    defaultMessage: 'Sorry! Something went wrong',
    description:
      'The message that appears in notification when a new user creation fails'
  }
}

export const messages: INotificationsMessages = defineMessages(messagesToDefine)
