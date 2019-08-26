import { defineMessages } from 'react-intl'

interface ISelectContactPointMessages {
  heading: ReactIntl.FormattedMessage.MessageDescriptor
  birthRelationshipLabel: ReactIntl.FormattedMessage.MessageDescriptor
  error: ReactIntl.FormattedMessage.MessageDescriptor
  phoneNumberNotValid: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: ISelectContactPointMessages = {
  heading: {
    id: 'register.SelectContactPoint.heading',
    defaultMessage: 'Who is the main point of contact for this application?',
    description: 'The section heading on the page'
  },
  birthRelationshipLabel: {
    id: 'register.SelectContactPoint.birthRelationshipLabel',
    defaultMessage: 'Relationship to child',
    description: 'Relationship Label for birth'
  },
  error: {
    id: 'register.SelectContactPoint.error',
    defaultMessage: 'Please select a main point of contact',
    description: 'Error text'
  },
  phoneNumberNotValid: {
    id: 'register.SelectContactPoint.phoneNoError',
    defaultMessage: 'Not a valid mobile number',
    description: 'Phone no error text'
  }
}

export const messages: ISelectContactPointMessages = defineMessages(
  messagesToDefine
)
