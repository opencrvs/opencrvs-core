import { defineMessages, MessageDescriptor } from 'react-intl'

interface ISelectInformantMessages {
  birthInformantTitle: MessageDescriptor
  deathInformantTitle: MessageDescriptor
  parents: MessageDescriptor
  birthErrorMessage: MessageDescriptor
  deathErrorMessage: MessageDescriptor
}

const messagesToDefine: ISelectInformantMessages = {
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
