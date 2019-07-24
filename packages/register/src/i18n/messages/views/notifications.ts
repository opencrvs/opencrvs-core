import { defineMessages } from 'react-intl'

interface INotificationsMessages {
  newContentAvailable: ReactIntl.FormattedMessage.MessageDescriptor
  declarationsSynced: ReactIntl.FormattedMessage.MessageDescriptor
  draftsSaved: ReactIntl.FormattedMessage.MessageDescriptor
  userFormSuccess: ReactIntl.FormattedMessage.MessageDescriptor
  userFormFail: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: INotificationsMessages = {
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
