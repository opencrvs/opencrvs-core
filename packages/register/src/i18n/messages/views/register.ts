import { defineMessages, MessageDescriptor } from 'react-intl'

interface IRegisterMessages {
  newVitalEventRegistration: MessageDescriptor
  previewEventRegistration: MessageDescriptor
  reviewEventRegistration: MessageDescriptor
  submitDescription: MessageDescriptor
  registerFormQueryError: MessageDescriptor
  backToReviewButton: MessageDescriptor
}

const messagesToDefine: IRegisterMessages = {
  newVitalEventRegistration: {
    id: 'register.form.newVitalEventRegistration',
    defaultMessage:
      '{event, select, birth {Birth} death {Death} marriage {Marriage} divorce {Divorce} adoption {Adoption}} application',
    description: 'The message that appears for new vital event registration'
  },
  previewEventRegistration: {
    id: 'register.form.previewEventRegistration',
    defaultMessage:
      '{event, select, birth {Birth} death {Death} marriage {Marriage} divorce {Divorce} adoption {Adoption}} Application Preview',
    description: 'The message that appears for new birth registrations'
  },
  reviewEventRegistration: {
    id: 'register.form.reviewEventRegistration',
    defaultMessage:
      '{event, select, birth {Birth} death {Death} marriage {Marriage} divorce {Divorce} adoption {Adoption}} Application Review',
    description: 'The message that appears for new birth registrations'
  },
  submitDescription: {
    id: 'register.form.modal.submitDescription',
    defaultMessage:
      'By clicking “Submit” you confirm that the informant has read and reviewed the information and understands that this information will be shared with Civil Registration authorities.',
    description: 'Submit description text on submit modal'
  },
  registerFormQueryError: {
    id: 'register.registerForm.queryError',
    defaultMessage:
      'The page cannot be loaded at this time due to low connectivity or a network error. Please click refresh to try again, or try again later.',
    description: 'The error message shown when a search query fails'
  },
  backToReviewButton: {
    id: 'register.selectVitalEvent.backToReviewButton',
    defaultMessage: 'Back to review'
  }
}

export const messages: IRegisterMessages = defineMessages(messagesToDefine)
