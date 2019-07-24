import { defineMessages } from 'react-intl'

interface IConstantsMessages {
  areYouSure: ReactIntl.FormattedMessage.MessageDescriptor
}
const messaegsToDefine: IConstantsMessages = {
  areYouSure: {
    id: 'constants.areYouSure',
    defaultMessage: 'Are you sure?',
    description: 'Description for are you sure label in modals'
  }
}

export const constantsMessages: IConstantsMessages = defineMessages(
  messaegsToDefine
)
