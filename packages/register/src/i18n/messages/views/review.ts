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
  previewName: ReactIntl.FormattedMessage.MessageDescriptor
  previewTitle: ReactIntl.FormattedMessage.MessageDescriptor
  reviewName: ReactIntl.FormattedMessage.MessageDescriptor
  reviewTitle: ReactIntl.FormattedMessage.MessageDescriptor
  backToPreview: ReactIntl.FormattedMessage.MessageDescriptor
  editApplicationConfirmation: ReactIntl.FormattedMessage.MessageDescriptor
  headerSubjectWithoutName: ReactIntl.FormattedMessage.MessageDescriptor
  headerSubjectWithName: ReactIntl.FormattedMessage.MessageDescriptor
  additionalComments: ReactIntl.FormattedMessage.MessageDescriptor
  zeroDocumentsText: ReactIntl.FormattedMessage.MessageDescriptor
  editDocuments: ReactIntl.FormattedMessage.MessageDescriptor
  formDataHeader: ReactIntl.FormattedMessage.MessageDescriptor
  validateConfirmationTitle: ReactIntl.FormattedMessage.MessageDescriptor
  validateActionDescription: ReactIntl.FormattedMessage.MessageDescriptor
  valueApprove: ReactIntl.FormattedMessage.MessageDescriptor
  validateConfirmationDesc: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IReviewMessages = {
  validateConfirmationDesc: {
    id: 'register.form.modal.desc.validateConfirmation',
    defaultMessage:
      'This application will be sent to the registrar from them to approve.',
    description: 'Description for validate confirmation modal'
  },
  validateConfirmationTitle: {
    id: 'register.form.modal.title.validateConfirmation',
    defaultMessage: 'Send for approval?',
    description: 'Title for validate confirmation modal'
  },
  validateActionDescription: {
    id: 'review.validate.action.description',
    defaultMessage:
      '{isComplete, select, true {By sending for approval you confirm that the information has been reviewed by the applicant and that it is ready for approval.} false {Mandatory information is missing. Please add this information so that you can send for approval.}}',
    description: 'Description is shown when validation'
  },
  valueApprove: {
    id: 'review.button.approve',
    defaultMessage: 'Send for approval',
    description: 'Label for Send For Approval button'
  },
  formDataHeader: {
    id: 'review.formData.header',
    defaultMessage:
      '{isDraft, select, true {Check responses with the applicant before sending for review} false {Review the answers with the supporting documents}}',
    description: 'Label for form data header text'
  },
  headerSubjectWithoutName: {
    id: 'review.header.subject.subjectWithoutName',
    defaultMessage:
      '{eventType, select, birth {Birth} death {Death}} Application',
    description: 'Header subject that shows which application type to review'
  },
  headerSubjectWithName: {
    id: 'review.header.subject.subjectWitName',
    defaultMessage:
      '{eventType, select, birth {Birth} death {Death}} Application for {name}',
    description:
      'Header subject that shows which application type to review with applicant name'
  },
  additionalComments: {
    id: 'review.inputs.additionalComments',
    defaultMessage: 'Any additional comments?',
    description: 'Label for input Additional comments'
  },
  zeroDocumentsText: {
    id: 'review.documents.zeroDocumentsText',
    defaultMessage:
      'No supporting documents for {section, select, child {child} mother {mother} father {father} deceased {deceased} informant {informant}}',
    description: 'Zero documents text'
  },
  editDocuments: {
    id: 'review.documents.editDocuments',
    defaultMessage: 'Add attachement',
    description: 'Edit documents text'
  },
  backToPreview: {
    id: 'review.edit.modal.backToPreview',
    defaultMessage: 'Back to Preview',
    description: 'Preview button on edit modal'
  },
  editApplicationConfirmation: {
    id: 'review.edit.modal.confirmationText',
    defaultMessage: 'Are you sure you want to edit the application?',
    description: 'Edit modal confirmation text'
  },
  reviewName: {
    id: 'review.form.section.review.name',
    defaultMessage: 'Review',
    description: 'Form section name for Review'
  },
  reviewTitle: {
    id: 'review.form.section.review.title',
    defaultMessage: 'Review',
    description: 'Form section title for Review'
  },
  previewName: {
    id: 'register.form.section.preview.name',
    defaultMessage: 'Preview',
    description: 'Form section name for Preview'
  },
  previewTitle: {
    id: 'register.form.section.preview.title',
    defaultMessage: 'Preview',
    description: 'Form section title for Preview'
  },
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

interface IDynamicReviewMessages {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
}

const dynamicMessagesToDefine = {
  bgdGovtName: {
    id: 'review.header.title.govtName.bgd',
    defaultMessage: 'Government of the peoples republic of Bangladesh',
    description: 'Header title that shows bgd govt name'
  }
}

export const dynamicMessages: IDynamicReviewMessages = defineMessages(
  dynamicMessagesToDefine
)
