import { defineMessages, MessageDescriptor } from 'react-intl'

interface ISelectPrimaryApplicantMessages {
  registerNewEventTitle: MessageDescriptor
  registerNewEventHeading: MessageDescriptor
  errorMessage: MessageDescriptor
}

const messagesToDefine: ISelectPrimaryApplicantMessages = {
  registerNewEventTitle: {
    id: 'register.selectVitalEvent.registerNewEventTitle',
    defaultMessage: 'New application',
    description: 'The title that appears on the select vital event page'
  },
  registerNewEventHeading: {
    id: 'register.selectVitalEvent.registerNewEventHeading',
    defaultMessage: 'What type of event do you want to declare?',
    description: 'The section heading on the page'
  },
  errorMessage: {
    id: 'register.selectVitalEvent.errorMessage',
    defaultMessage: 'Please select the type of event',
    description: 'Error Message to show when no event is being selected'
  }
}

export const messages: ISelectPrimaryApplicantMessages = defineMessages(
  messagesToDefine
)
