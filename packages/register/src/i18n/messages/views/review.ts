import { defineMessages } from 'react-intl'

interface IReviewMessages {
  additionalComments: ReactIntl.FormattedMessage.MessageDescriptor
  backToPreview: ReactIntl.FormattedMessage.MessageDescriptor
  editApplicationConfirmation: ReactIntl.FormattedMessage.MessageDescriptor
  editDocuments: ReactIntl.FormattedMessage.MessageDescriptor
  formDataHeader: ReactIntl.FormattedMessage.MessageDescriptor
  headerSubjectWithName: ReactIntl.FormattedMessage.MessageDescriptor
  headerSubjectWithoutName: ReactIntl.FormattedMessage.MessageDescriptor
  previewName: ReactIntl.FormattedMessage.MessageDescriptor
  previewTitle: ReactIntl.FormattedMessage.MessageDescriptor
  registerActionDescription: ReactIntl.FormattedMessage.MessageDescriptor
  registerActionDescriptionComplete: ReactIntl.FormattedMessage.MessageDescriptor
  registerActionDescriptionIncomplete: ReactIntl.FormattedMessage.MessageDescriptor
  registerActionTitle: ReactIntl.FormattedMessage.MessageDescriptor
  registerConfirmationTitle: ReactIntl.FormattedMessage.MessageDescriptor
  reviewActionDescriptionComplete: ReactIntl.FormattedMessage.MessageDescriptor
  reviewActionDescriptionIncomplete: ReactIntl.FormattedMessage.MessageDescriptor
  reviewActionTitle: ReactIntl.FormattedMessage.MessageDescriptor
  reviewName: ReactIntl.FormattedMessage.MessageDescriptor
  reviewTitle: ReactIntl.FormattedMessage.MessageDescriptor
  submitConfirmationDesc: ReactIntl.FormattedMessage.MessageDescriptor
  submitConfirmationTitle: ReactIntl.FormattedMessage.MessageDescriptor
  validateActionDescription: ReactIntl.FormattedMessage.MessageDescriptor
  validateConfirmationDesc: ReactIntl.FormattedMessage.MessageDescriptor
  validateConfirmationTitle: ReactIntl.FormattedMessage.MessageDescriptor
  valueApprove: ReactIntl.FormattedMessage.MessageDescriptor
  zeroDocumentsText: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IReviewMessages = {
  additionalComments: {
    defaultMessage: 'Any additional comments?',
    description: 'Label for input Additional comments',
    id: 'review.inputs.additionalComments'
  },
  backToPreview: {
    defaultMessage: 'Back to Preview',
    description: 'Preview button on edit modal',
    id: 'review.edit.modal.backToPreview'
  },
  editApplicationConfirmation: {
    defaultMessage: 'Are you sure you want to edit the application?',
    description: 'Edit modal confirmation text',
    id: 'review.edit.modal.confirmationText'
  },
  editDocuments: {
    defaultMessage: 'Add attachement',
    description: 'Edit documents text',
    id: 'review.documents.editDocuments'
  },
  formDataHeader: {
    defaultMessage:
      '{isDraft, select, true {Check responses with the applicant before sending for review} false {Review the answers with the supporting documents}}',
    description: 'Label for form data header text',
    id: 'review.formData.header'
  },
  headerSubjectWithName: {
    defaultMessage:
      '{eventType, select, birth {Birth} death {Death}} Application for {name}',
    description:
      'Header subject that shows which application type to review with applicant name',
    id: 'review.header.subject.subjectWitName'
  },
  headerSubjectWithoutName: {
    defaultMessage:
      '{eventType, select, birth {Birth} death {Death}} Application',
    description: 'Header subject that shows which application type to review',
    id: 'review.header.subject.subjectWithoutName'
  },
  previewName: {
    defaultMessage: 'Preview',
    description: 'Form section name for Preview',
    id: 'register.form.section.preview.name'
  },
  previewTitle: {
    defaultMessage: 'Preview',
    description: 'Form section title for Preview',
    id: 'register.form.section.preview.title'
  },
  registerActionDescription: {
    defaultMessage:
      'By registering this birth, a birth certificate will be generated with your signature for issuance.',
    id: 'review.actions.description'
  },
  registerActionDescriptionComplete: {
    defaultMessage:
      'By clicking register, you confirm that the information is correct and has been reviewed by the applicant. The applicant understands that it will be used to register the birth and for planning purposes.\n\nBy registering this birth, a birth certificate will be generated with your signature for issuance.',
    id: 'review.actions.description.registerConfirmComplete'
  },
  registerActionDescriptionIncomplete: {
    defaultMessage:
      'Mandatory information is missing. Please add this information so that you can complete the registration process.',
    id: 'review.actions.description.registerConfirmInComplete'
  },
  registerActionTitle: {
    defaultMessage: 'Register or reject?',
    id: 'review.actions.title.registerActionTitle'
  },
  registerConfirmationTitle: {
    defaultMessage: 'Register this application?',
    description: 'Title for register confirmation modal',
    id: 'review.modal.title.registerConfirmation'
  },
  reviewActionDescriptionComplete: {
    defaultMessage:
      'By sending this application for review, you confirm that the information is correct and has been reviewed by the applicant. The applicant understands that it will be used to register the birth and for planning purposes.',
    description:
      'Description for review action component when complete application',
    id: 'review.actions.description.confirmComplete'
  },
  reviewActionDescriptionIncomplete: {
    defaultMessage:
      'By sending this incomplete application, there will be a digital record made.\n\nTell the applicant that they will receive an SMS with a tracking ID. They will need this to complete the application at a registration office within 30 days. The applicant will need to provide all mandatory information before the birth can be registered.',
    description:
      'Description for review action component when incomplete application',
    id: 'review.actions.description.confirmInComplete'
  },
  reviewActionTitle: {
    defaultMessage:
      'Application is {isComplete, select, true {complete} false {incomplete}}',
    description: 'Title for review action component',
    id: 'review.actions.title.applicationStatus'
  },
  reviewName: {
    defaultMessage: 'Review',
    description: 'Form section name for Review',
    id: 'review.form.section.review.name'
  },
  reviewTitle: {
    defaultMessage: 'Review',
    description: 'Form section title for Review',
    id: 'review.form.section.review.title'
  },
  submitConfirmationDesc: {
    defaultMessage:
      '{isComplete, select, true {This application will be sent to the registrar for them to review.} false {This application will be sent to the register who is now required to complete the application.}}',
    description: 'Submit description text on modal',
    id: 'review.modal.desc.submitConfirmation'
  },
  submitConfirmationTitle: {
    defaultMessage:
      '{isComplete, select, true {Send application for review?} false {Send incomplete application?}}',
    description: 'Submit title text on modal',
    id: 'review.modal.title.submitConfirmation'
  },
  validateActionDescription: {
    defaultMessage:
      '{isComplete, select, true {By sending for approval you confirm that the information has been reviewed by the applicant and that it is ready for approval.} false {Mandatory information is missing. Please add this information so that you can send for approval.}}',
    description: 'Description is shown when validation',
    id: 'review.validate.action.description'
  },
  validateConfirmationDesc: {
    defaultMessage:
      'This application will be sent to the registrar from them to approve.',
    description: 'Description for validate confirmation modal',
    id: 'register.form.modal.desc.validateConfirmation'
  },
  validateConfirmationTitle: {
    defaultMessage: 'Send for approval?',
    description: 'Title for validate confirmation modal',
    id: 'register.form.modal.title.validateConfirmation'
  },
  valueApprove: {
    defaultMessage: 'Send for approval',
    description: 'Label for Send For Approval button',
    id: 'review.button.approve'
  },
  zeroDocumentsText: {
    defaultMessage:
      'No supporting documents for {section, select, child {child} mother {mother} father {father} deceased {deceased} informant {informant}}',
    description: 'Zero documents text',
    id: 'review.documents.zeroDocumentsText'
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
