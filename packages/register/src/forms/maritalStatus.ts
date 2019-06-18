import { defineMessages } from 'react-intl'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  maritalStatus: {
    id: 'formFields.maritalStatus',
    defaultMessage: 'Marital status',
    description: 'Label for form field: Marital status'
  },
  maritalStatusSingle: {
    id: 'formFields.maritalStatusSingle',
    defaultMessage: 'Unmarried',
    description: 'Option for form field: Marital status'
  },
  maritalStatusMarried: {
    id: 'formFields.maritalStatusMarried',
    defaultMessage: 'Married',
    description: 'Option for form field: Marital status'
  },
  maritalStatusWidowed: {
    id: 'formFields.maritalStatusWidowed',
    defaultMessage: 'Widowed',
    description: 'Option for form field: Marital status'
  },
  maritalStatusDivorced: {
    id: 'formFields.maritalStatusDivorced',
    defaultMessage: 'Divorced',
    description: 'Option for form field: Marital status'
  },
  maritalStatusNotStated: {
    id: 'formFields.maritalStatusNotStated',
    defaultMessage: 'Not stated',
    description: 'Option for form field: Marital status'
  },
  dateOfMarriage: {
    id: 'formFields.dateOfMarriage',
    defaultMessage: 'Date of marriage',
    description: 'Option for form field: Date of marriage'
  }
})
