import { IFormSection, ViewType, PDF_DOCUMENT_VIEWER } from 'src/forms'
import { defineMessages } from 'react-intl'

const messages = defineMessages({
  preview: {
    id: 'register.workQueue.print.certificatePreview',
    defaultMessage: 'Certificate Preview',
    description: 'The title for certificate preview form'
  },
  selectSignature: {
    id: 'register.workQueue.print.selectSignature',
    defaultMessage: 'Select e-signatures',
    description: 'The label for choose signature select'
  },
  addAnotherSignature: {
    id: 'register.workQueue.print.addAnotherSignature',
    defaultMessage: 'Add another'
  },
  noLabel: {
    id: 'register.noLabel',
    defaultMessage: ' '
  },
  person1: {
    id: 'register.workQueue.print.signature.person1',
    defaultMessage: 'UP Secretary Shakib al hasan'
  },
  person2: {
    id: 'register.workQueue.print.signature.person2',
    defaultMessage: 'Local Registrar Mohammad Ashraful'
  },
  informantHasReviewedInformaiton: {
    id: 'register.workQueue.print.userReviewed',
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
