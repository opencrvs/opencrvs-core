import { defineMessages } from 'react-intl'

interface ISessionMessages {
  sessionExpireTxt: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: ISessionMessages = {
  sessionExpireTxt: {
    id: 'login.session.expired',
    defaultMessage: 'Your session has expired. Please login again.',
    description: 'SessionExpire modal confirmation text'
  }
}

export const messages: ISessionMessages = defineMessages(messagesToDefine)
