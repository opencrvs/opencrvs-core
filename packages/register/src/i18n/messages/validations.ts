import { defineMessages } from 'react-intl'

interface IValidationMessages {
  blockAlphaNumericDot: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IValidationMessages = {
  blockAlphaNumericDot: {
    id: 'validations.blockAlphaNumericDot',
    defaultMessage:
      'Can contain only block character, number and dot (e.g. C91.5)',
    description: 'The error message that appears when an invalid value is used'
  }
}

export const validationMessages: IValidationMessages = defineMessages(
  messagesToDefine
)
