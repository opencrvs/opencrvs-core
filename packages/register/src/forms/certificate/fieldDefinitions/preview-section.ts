import { IFormSection, ViewType, PDF_DOCUMENT_VIEWER } from '@register/forms'
import { defineMessages } from 'react-intl'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  preview: {
    id: 'print.certificate.certificatePreview',
    defaultMessage: 'Certificate Preview',
    description: 'The title for certificate preview form'
  },
  selectSignature: {
    id: 'print.certificate.selectSignature',
    defaultMessage: 'Select e-signatures',
    description: 'The label for choose signature select'
  },
  addAnotherSignature: {
    id: 'print.certificate.addAnotherSignature',
    defaultMessage: 'Add another'
  },
  noLabel: {
    id: 'register.noLabel',
    defaultMessage: ' '
  },
  person1: {
    id: 'print.certificate.signature.person1',
    defaultMessage: 'UP Secretary Shakib al hasan'
  },
  person2: {
    id: 'print.certificate.signature.person2',
    defaultMessage: 'Local Registrar Mohammad Ashraful'
  },
  informantHasReviewedInformaiton: {
    id: 'print.certificate.userReviewed',
    defaultMessage:
      'The informant has reviewed and confirmed that the information on the certificate is correct.'
  }
})

export const certificatePreview: IFormSection = {
  id: 'certificatePreview',
  viewType: 'form' as ViewType,
  name: messages.preview,
  title: messages.preview,
  fields: [
    {
      name: 'certificate',
      type: PDF_DOCUMENT_VIEWER,
      label: messages.noLabel,
      initialValue: '',
      validate: []
    }
  ]
}
