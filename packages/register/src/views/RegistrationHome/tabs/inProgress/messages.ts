import { defineMessages } from 'react-intl'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  applicationCreationLabel: {
    id: 'application.creation.label',
    defaultMessage: 'Started on'
  },
  applicationInformantLabel: {
    id: 'application.informant.label',
    defaultMessage: 'Informant'
  },
  MOTHER: {
    id: 'application.informant.value.mother',
    defaultMessage: 'Mother'
  },
  FATHER: {
    id: 'application.informant.value.father',
    defaultMessage: 'Father'
  },
  applicationInitiatorLabel: {
    id: 'application.initiator.label',
    defaultMessage: 'By'
  },
  queryError: {
    id: 'expansion.info.queryError',
    defaultMessage: 'An error occurred while fetching details'
  }
})
