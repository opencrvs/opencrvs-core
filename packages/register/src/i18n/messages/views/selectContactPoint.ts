import { defineMessages } from 'react-intl'

interface ISelectContactPointMessages {
  title: ReactIntl.FormattedMessage.MessageDescriptor
  heading: ReactIntl.FormattedMessage.MessageDescriptor
  birthRelationshipLabel: ReactIntl.FormattedMessage.MessageDescriptor
  error: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: ISelectContactPointMessages = {
  title: {
    id: 'register.SelectContactPoint.title',
    defaultMessage: 'Birth application',
    description: 'The title that appears on the select vital event page'
  },
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
  }
}

export const messages: ISelectContactPointMessages = defineMessages(
  messagesToDefine
)
