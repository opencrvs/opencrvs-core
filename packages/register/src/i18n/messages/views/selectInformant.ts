import { defineMessages } from 'react-intl'

interface ISelectInformantMessages {
  newBirthRegistration: ReactIntl.FormattedMessage.MessageDescriptor
  birthInformantTitle: ReactIntl.FormattedMessage.MessageDescriptor
  deathInformantTitle: ReactIntl.FormattedMessage.MessageDescriptor
  parents: ReactIntl.FormattedMessage.MessageDescriptor
  birthErrorMessage: ReactIntl.FormattedMessage.MessageDescriptor
  deathErrorMessage: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: ISelectInformantMessages = {
  newBirthRegistration: {
    id: 'register.selectInformant.newBirthRegistration',
    defaultMessage: 'New birth application',
    description: 'The message that appears for new birth registrations'
  },
  birthInformantTitle: {
    id: 'register.selectInformant.birthInformantTitle',
    defaultMessage: 'Who is applying for birth registration?',
    description: 'The title that appears when asking for the birth informant'
  },
  deathInformantTitle: {
    id: 'register.selectInformant.deathInformantTitle',
    defaultMessage:
      'What relationship does the applicant have to the deceased?',
    description: 'The title that appears when asking for the death informant'
  },
  parents: {
    id: 'register.selectInformant.parents',
    defaultMessage: 'Mother & Father',
    description:
      'The description that appears when selecting the parent as informant'
  },
  birthErrorMessage: {
    id: 'register.selectInformant.birthErrorMessage',
    defaultMessage: 'Please select who is present and applying',
    description: 'Error Message to show when no informant is selected for birth'
  },
  deathErrorMessage: {
    id: 'register.selectInformant.deathErrorMessage',
    defaultMessage:
      'Please select the relationship to the deceased and any relevant contact details.',
    description: 'Error Message to show when no informant is selected for death'
  }
}

export const messages: ISelectInformantMessages = defineMessages(
  messagesToDefine
)
