import { defineMessages } from 'react-intl'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  maritalStatus: {
    id: 'form.field.label.maritalStatus',
    defaultMessage: 'Marital status',
    description: 'Label for form field: Marital status'
  },
  maritalStatusSingle: {
    id: 'form.field.label.maritalStatusSingle',
    defaultMessage: 'Unmarried',
    description: 'Option for form field: Marital status'
  },
  maritalStatusMarried: {
    id: 'form.field.label.maritalStatusMarried',
    defaultMessage: 'Married',
    description: 'Option for form field: Marital status'
  },
  maritalStatusWidowed: {
    id: 'form.field.label.maritalStatusWidowed',
    defaultMessage: 'Widowed',
    description: 'Option for form field: Marital status'
  },
  maritalStatusDivorced: {
    id: 'form.field.label.maritalStatusDivorced',
    defaultMessage: 'Divorced',
    description: 'Option for form field: Marital status'
  },
  maritalStatusNotStated: {
    id: 'form.field.label.maritalStatusNotStated',
    defaultMessage: 'Not stated',
    description: 'Option for form field: Marital status'
  },
  dateOfMarriage: {
    id: 'form.field.label.dateOfMarriage',
    defaultMessage: 'Date of marriage',
    description: 'Option for form field: Date of marriage'
  }
})
