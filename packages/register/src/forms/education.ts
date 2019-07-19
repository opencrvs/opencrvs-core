import { defineMessages } from 'react-intl'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  educationAttainmentNone: {
    id: 'form.field.label.educationAttainmentNone',
    defaultMessage: 'No schooling',
    description: 'Option for form field: no education'
  },
  educationAttainmentISCED1: {
    id: 'form.field.label.educationAttainmentISCED1',
    defaultMessage: 'Primary',
    description: 'Option for form field: ISCED1 education'
  },
  educationAttainmentISCED2: {
    id: 'form.field.label.educationAttainmentISCED2',
    defaultMessage: 'Lower secondary',
    description: 'Option for form field: ISCED2 education'
  },
  educationAttainmentISCED3: {
    id: 'form.field.label.educationAttainmentISCED3',
    defaultMessage: 'Upper secondary',
    description: 'Option for form field: ISCED3 education'
  },
  educationAttainmentISCED4: {
    id: 'form.field.label.educationAttainmentISCED4',
    defaultMessage: 'Post secondary',
    description: 'Option for form field: ISCED4 education'
  },
  educationAttainmentISCED5: {
    id: 'form.field.label.educationAttainmentISCED5',
    defaultMessage: 'First stage tertiary',
    description: 'Option for form field: ISCED5 education'
  },
  educationAttainmentISCED6: {
    id: 'form.field.label.educationAttainmentISCED6',
    defaultMessage: 'Second stage tertiary',
    description: 'Option for form field: ISCED6 education'
  },
  educationAttainmentNotStated: {
    id: 'form.field.label.educationAttainmentNotStated',
    defaultMessage: 'Not stated',
    description: 'Option for form field: not stated education'
  }
})
