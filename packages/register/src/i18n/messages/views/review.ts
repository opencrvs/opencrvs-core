import { defineMessages } from 'react-intl'

interface IReviewMessages {
  reviewActionTitle: ReactIntl.FormattedMessage.MessageDescriptor
  reviewActionDescriptionIncomplete: ReactIntl.FormattedMessage.MessageDescriptor
  reviewActionDescriptionComplete: ReactIntl.FormattedMessage.MessageDescriptor
  registerActionDescriptionIncomplete: ReactIntl.FormattedMessage.MessageDescriptor
  registerActionDescriptionComplete: ReactIntl.FormattedMessage.MessageDescriptor
  registerActionTitle: ReactIntl.FormattedMessage.MessageDescriptor
  registerActionDescription: ReactIntl.FormattedMessage.MessageDescriptor
  submitConfirmationTitle: ReactIntl.FormattedMessage.MessageDescriptor
  submitConfirmationDesc: ReactIntl.FormattedMessage.MessageDescriptor
  registerConfirmationTitle: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IReviewMessages = {
  reviewActionTitle: {
    id: 'review.actions.title.applicationStatus',
    defaultMessage:
      'Application is {isComplete, select, true {complete} false {incomplete}}',
    description: 'Title for review action component'
  },
  reviewActionDescriptionIncomplete: {
    id: 'review.actions.description.confirmInComplete',
    defaultMessage:
      'By sending this incomplete application, there will be a digital record made.\n\nTell the applicant that they will receive an SMS with a tracking ID. They will need this to complete the application at a registration office within 30 days. The applicant will need to provide all mandatory information before the birth can be registered.',
    description:
      'Description for review action component when incomplete application'
  },
  reviewActionDescriptionComplete: {
    id: 'review.actions.description.confirmComplete',
    defaultMessage:
      'By sending this application for review, you confirm that the information is correct and has been reviewed by the applicant. The applicant understands that it will be used to register the birth and for planning purposes.',
    description:
      'Description for review action component when complete application'
  },
  registerActionDescriptionIncomplete: {
    id: 'review.actions.description.registerConfirmInComplete',
    defaultMessage:
      'Mandatory information is missing. Please add this information so that you can complete the registration process.'
  },
  registerActionDescriptionComplete: {
    id: 'review.actions.description.registerConfirmComplete',
    defaultMessage:
      'By clicking register, you confirm that the information is correct and has been reviewed by the applicant. The applicant understands that it will be used to register the birth and for planning purposes.\n\nBy registering this birth, a birth certificate will be generated with your signature for issuance.'
  },
  registerActionTitle: {
    id: 'review.actions.title.registerActionTitle',
    defaultMessage: 'Register or reject?'
  },
  registerActionDescription: {
    id: 'review.actions.description',
    defaultMessage:
      'By registering this birth, a birth certificate will be generated with your signature for issuance.'
  },
  submitConfirmationTitle: {
    id: 'review.modal.title.submitConfirmation',
    defaultMessage:
      '{isComplete, select, true {Send application for review?} false {Send incomplete application?}}',
    description: 'Submit title text on modal'
  },
  submitConfirmationDesc: {
    id: 'review.modal.desc.submitConfirmation',
    defaultMessage:
      '{isComplete, select, true {This application will be sent to the registrar for them to review.} false {This application will be sent to the register who is now required to complete the application.}}',
    description: 'Submit description text on modal'
  },
  registerConfirmationTitle: {
    id: 'review.modal.title.registerConfirmation',
    defaultMessage: 'Register this application?',
    description: 'Title for register confirmation modal'
  }
}

export const messages: IReviewMessages = defineMessages(messagesToDefine)
