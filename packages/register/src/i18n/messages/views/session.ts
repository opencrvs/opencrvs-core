import { defineMessages, MessageDescriptor } from 'react-intl'

interface ISessionMessages {
  sessionExpireTxt: MessageDescriptor
}

const messagesToDefine: ISessionMessages = {
  sessionExpireTxt: {
    id: 'login.session.expired',
    defaultMessage: 'Your session has expired. Please login again.',
    description: 'SessionExpire modal confirmation text'
  }
}

export const messages: ISessionMessages = defineMessages(messagesToDefine)
