import { defineMessages, MessageDescriptor } from 'react-intl'

interface ISelectPrimaryApplicantMessages {
  registerNewEventTitle: MessageDescriptor
  registerNewEventHeading: MessageDescriptor
  primaryApplicantDescription: MessageDescriptor
  errorMessage: MessageDescriptor
}

const messagesToDefine: ISelectPrimaryApplicantMessages = {
  registerNewEventTitle: {
    id: 'register.selectVitalEvent.registerNewEventTitle',
    defaultMessage: 'New application',
    description: 'The title that appears on the select vital event page'
  },
  registerNewEventHeading: {
    id: 'register.primaryApplicant.registerNewEventHeading',
    defaultMessage: 'Who is the primary applicant for this application?',
    description: 'The section heading on the page'
  },
  primaryApplicantDescription: {
    id: 'register.primaryApplicant.description',
    defaultMessage:
      'This person is responsible for providing accurate information in this application. ',
    description: 'The section heading on the page'
  },
  errorMessage: {
    id: 'register.primaryApplicant.errorMessage',
    defaultMessage: 'Please select who is the primary applicant',
    description: 'Error Message to show when no event is being selected'
  }
}

export const messages: ISelectPrimaryApplicantMessages = defineMessages(
  messagesToDefine
)
