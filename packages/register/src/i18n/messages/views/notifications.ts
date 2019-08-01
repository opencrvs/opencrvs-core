import { defineMessages } from 'react-intl'

interface INotificationsMessages {
  declarationsSynced: ReactIntl.FormattedMessage.MessageDescriptor
  draftsSaved: ReactIntl.FormattedMessage.MessageDescriptor
  newContentAvailable: ReactIntl.FormattedMessage.MessageDescriptor
  outboxText: ReactIntl.FormattedMessage.MessageDescriptor
  processingText: ReactIntl.FormattedMessage.MessageDescriptor
  statusRegistering: ReactIntl.FormattedMessage.MessageDescriptor
  statusRejecting: ReactIntl.FormattedMessage.MessageDescriptor
  statusSubmitting: ReactIntl.FormattedMessage.MessageDescriptor
  statusWaitingToRegister: ReactIntl.FormattedMessage.MessageDescriptor
  statusWaitingToReject: ReactIntl.FormattedMessage.MessageDescriptor
  statusWaitingToSubmit: ReactIntl.FormattedMessage.MessageDescriptor
  userFormFail: ReactIntl.FormattedMessage.MessageDescriptor
  userFormSuccess: ReactIntl.FormattedMessage.MessageDescriptor
  waitingToRetry: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: INotificationsMessages = {
  declarationsSynced: {
    defaultMessage:
      'As you have connectivity, we have synced {syncCount} new birth declarations.',
    description:
      'The message that appears in notification when background sync takes place',
    id: 'notification.declarationsSynced'
  },
  draftsSaved: {
    defaultMessage: 'Your draft has been saved',
    description:
      'The message that appears in notification when save drafts button is clicked',
    id: 'notification.draftsSaved'
  },
  newContentAvailable: {
    defaultMessage: "We've made some updates, click here to refresh.",
    description:
      'The message that appears in notification when new content available.',
    id: 'notification.newContentAvailable'
  },
  outboxText: {
    defaultMessage: 'Outbox({num})',
    description: 'Application outbox text',
    id: 'notification.outboxText'
  },
  processingText: {
    defaultMessage: '{num} application processing...',
    description: 'Application processing text',
    id: 'notification.processingText'
  },
  statusRegistering: {
    defaultMessage: 'Registering...',
    description: 'Label for application status Registering',
    id: 'register.registrationHome.outbox.statusRegistering'
  },
  statusRejecting: {
    defaultMessage: 'Rejecting...',
    description: 'Label for application status Rejecting',
    id: 'register.registrationHome.outbox.statusRejecting'
  },
  statusSubmitting: {
    defaultMessage: 'Submitting...',
    description: 'Label for application status submitting',
    id: 'register.registrationHome.outbox.statusSubmitting'
  },
  statusWaitingToRegister: {
    defaultMessage: 'Waiting to register',
    description: 'Label for application status waiting for register',
    id: 'register.registrationHome.outbox.statusWaitingToRegister'
  },
  statusWaitingToReject: {
    defaultMessage: 'Waiting to reject',
    description: 'Label for application status waiting for reject',
    id: 'register.registrationHome.outbox.statusWaitingToReject'
  },
  statusWaitingToSubmit: {
    defaultMessage: 'Waiting to submit',
    description: 'Label for application status waiting for reject',
    id: 'register.registrationHome.outbox.statusWaitingToSubmit'
  },
  userFormFail: {
    defaultMessage: 'Sorry! Something went wrong',
    description:
      'The message that appears in notification when a new user creation fails',
    id: 'notification.sorryError'
  },
  userFormSuccess: {
    defaultMessage: 'New user created',
    description:
      'The message that appears in notification when a new user is created',
    id: 'notification.userFormSuccess'
  },
  waitingToRetry: {
    defaultMessage: 'Waiting to retry',
    description: 'Label for application status waiting for connection',
    id: 'register.registrationHome.outbox.waitingToRetry'
  }
}

export const messages: INotificationsMessages = defineMessages(messagesToDefine)
