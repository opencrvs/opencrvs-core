import { defineMessages } from 'react-intl'

interface ICertificateMessages {
  certificateCollectionTitle: ReactIntl.FormattedMessage.MessageDescriptor
  printCertificate: ReactIntl.FormattedMessage.MessageDescriptor
  print: ReactIntl.FormattedMessage.MessageDescriptor
  whoToCollect: ReactIntl.FormattedMessage.MessageDescriptor
  informant: ReactIntl.FormattedMessage.MessageDescriptor
  mother: ReactIntl.FormattedMessage.MessageDescriptor
  father: ReactIntl.FormattedMessage.MessageDescriptor
  other: ReactIntl.FormattedMessage.MessageDescriptor
  payment: ReactIntl.FormattedMessage.MessageDescriptor
  paymentMethod: ReactIntl.FormattedMessage.MessageDescriptor
  manualPaymentMethod: ReactIntl.FormattedMessage.MessageDescriptor
  collectPayment: ReactIntl.FormattedMessage.MessageDescriptor
  service: ReactIntl.FormattedMessage.MessageDescriptor
  paymentAmount: ReactIntl.FormattedMessage.MessageDescriptor
  preview: ReactIntl.FormattedMessage.MessageDescriptor
  selectSignature: ReactIntl.FormattedMessage.MessageDescriptor
  addAnotherSignature: ReactIntl.FormattedMessage.MessageDescriptor
  noLabel: ReactIntl.FormattedMessage.MessageDescriptor
  person1: ReactIntl.FormattedMessage.MessageDescriptor
  person2: ReactIntl.FormattedMessage.MessageDescriptor
  informantHasReviewedInformaiton: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: ICertificateMessages = {
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
    id: 'print.certificate.noLabel',
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
  },
  certificateCollectionTitle: {
    id: 'print.certificate.section.title',
    defaultMessage: 'Certificate Collection',
    description: 'The title of print certificate action'
  },
  printCertificate: {
    id: 'print.certificate.form.name',
    defaultMessage: 'Print',
    description: 'The title of review button in list expansion actions'
  },
  print: {
    id: 'print.certificate.form.title',
    defaultMessage: 'Print certificate',
    description: 'The title of review button in list expansion actions'
  },
  whoToCollect: {
    id: 'print.certificate.collector.whoToCollect',
    defaultMessage: 'Who is collecting the certificate?',
    description: 'The label for collector of certificate select'
  },
  informant: {
    id: 'print.certificate.collector.informant',
    defaultMessage: 'Informant',
    description:
      'The label for select value when informant is the collector of certificate'
  },
  mother: {
    id: 'print.certificate.collector.mother',
    defaultMessage: 'Mother',
    description:
      'The label for select value when mother is the collector of certificate'
  },
  father: {
    id: 'print.certificate.collector.father',
    defaultMessage: 'Father',
    description:
      'The label for select value when father is the collector of certificate'
  },
  other: {
    id: 'print.certificate.collector.other',
    defaultMessage: 'Other',
    description:
      'The label for select value when the collector of certificate is other person'
  },
  payment: {
    id: 'print.certificate.payment',
    defaultMessage: 'Payment',
    description: 'The title for payment section'
  },
  paymentMethod: {
    id: 'print.certificate.paymentMethod',
    defaultMessage: 'Payment method',
    description: 'The label for payment method select'
  },
  manualPaymentMethod: {
    id: 'print.certificate.manualPaymentMethod',
    defaultMessage: 'Manual',
    description: 'The label for select option for manual payment method'
  },
  collectPayment: {
    id: 'print.certificate.collectPayment',
    defaultMessage:
      'Please collect the payment, print the receipt and hand it over to the payee.',
    description: 'The label for collect payment paragraph'
  },
  service: {
    id: 'print.certificate.serviceMonth',
    defaultMessage:
      'Service: <strong>Birth registration after {service, plural, =0 {0 month} one {1 month} other{{service} months}} of D.o.B.</strong><br/>Amount Due:',
    description: 'The label for service paragraph'
  },
  paymentAmount: {
    id: 'print.certificate.paymentAmount',
    defaultMessage: '\u09F3 {paymentAmount}',
    description: 'The label for payment amount subsection'
  }
}

export const messages: ICertificateMessages = defineMessages(messagesToDefine)
