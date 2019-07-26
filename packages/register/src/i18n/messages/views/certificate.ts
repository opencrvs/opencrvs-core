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
  firstName: ReactIntl.FormattedMessage.MessageDescriptor
  familyName: ReactIntl.FormattedMessage.MessageDescriptor
  firstNameInEng: ReactIntl.FormattedMessage.MessageDescriptor
  familyNameInEng: ReactIntl.FormattedMessage.MessageDescriptor
  dateOfBirth: ReactIntl.FormattedMessage.MessageDescriptor
  nationality: ReactIntl.FormattedMessage.MessageDescriptor
  typeOfID: ReactIntl.FormattedMessage.MessageDescriptor
  number: ReactIntl.FormattedMessage.MessageDescriptor
  printReceipt: ReactIntl.FormattedMessage.MessageDescriptor
  next: ReactIntl.FormattedMessage.MessageDescriptor
  serviceYear: ReactIntl.FormattedMessage.MessageDescriptor
  serviceMonth: ReactIntl.FormattedMessage.MessageDescriptor
  certificateReceiptHeader: ReactIntl.FormattedMessage.MessageDescriptor
  certificateReceiptSubHeader: ReactIntl.FormattedMessage.MessageDescriptor
  receiptIssuedAt: ReactIntl.FormattedMessage.MessageDescriptor
  receiptIssuer: ReactIntl.FormattedMessage.MessageDescriptor
  receiptPaidAmount: ReactIntl.FormattedMessage.MessageDescriptor
  receiptService: ReactIntl.FormattedMessage.MessageDescriptor
  certificateIsCorrect: ReactIntl.FormattedMessage.MessageDescriptor
  certificateConfirmationTxt: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: ICertificateMessages = {
  certificateIsCorrect: {
    id: 'certificate.isCertificateCorrect',
    defaultMessage: 'Is the {event} certificate correct?',
    description:
      'Question asking the user if the information on the  certificate is correct'
  },
  certificateConfirmationTxt: {
    id: 'certificate.confirmCorrect',
    defaultMessage: 'Edit',
    description: 'Edit'
  },
  certificateReceiptHeader: {
    id: 'certificate.receipt.header',
    defaultMessage: 'Receipt for {event} Certificate of',
    description: 'Receipt header for payment on certificate'
  },
  certificateReceiptSubHeader: {
    id: 'certificate.receipt.subheader',
    defaultMessage: '{event} Registration after {DOBDiff} of {DOE}',
    description: 'Subheader for receipt on payment on certificate'
  },
  receiptIssuedAt: {
    id: 'certificate.receipt.issuedAt',
    defaultMessage: 'Issued at:',
    description: 'Receipt on payment on certificate issued at label'
  },
  receiptIssuer: {
    id: 'certificate.receipt.issuer',
    defaultMessage: 'By: {role}, {name}\n Date of payment: {dateOfPayment}',
    description: 'Issuer information for receipt of certificate payment label'
  },
  receiptPaidAmount: {
    id: 'certificate.receipt.amount',
    defaultMessage: 'Amount paid:\n\n',
    description: 'Amount paid for certificate label'
  },
  receiptService: {
    id: 'certificate.receipt.service',
    defaultMessage: 'Service:',
    description: 'Service received for receipt label'
  },
  printReceipt: {
    id: 'print.certificate.printReceipt',
    defaultMessage: 'Print receipt',
    description: 'The label for print receipt button'
  },
  next: {
    id: 'buttons.next',
    defaultMessage: 'Next',
    description: 'The label for next button'
  },
  serviceYear: {
    id: 'print.certificate.serviceYear',
    defaultMessage:
      'Service: <strong>Birth registration after {service, plural, =0 {0 year} one {1 year} other{{service} years}} of D.o.B.</strong><br/>Amount Due:',
    description: 'The label for service paragraph'
  },
  serviceMonth: {
    id: 'print.certificate.serviceMonth',
    defaultMessage:
      'Service: <strong>Birth registration after {service, plural, =0 {0 month} one {1 month} other{{service} months}} of D.o.B.</strong><br/>Amount Due:',
    description: 'The label for service paragraph'
  },
  firstName: {
    id: 'certificate.parent.details.label.firstName',
    defaultMessage: 'First Name(s)',
    description: 'Parent first names'
  },
  familyName: {
    id: 'certificate.parent.details.label.familyName',
    defaultMessage: 'Family Name',
    description: 'Parent family name'
  },
  firstNameInEng: {
    id: 'certificate.parent.details.label.firstNameInEng',
    defaultMessage: 'First Name(s)(in english)',
    description: 'Parent first names'
  },
  familyNameInEng: {
    id: 'certificate.parent.details.label.familyNameInEng',
    defaultMessage: 'Family Name(in english)',
    description: 'Parent family name'
  },
  dateOfBirth: {
    id: 'certificate.parent.details.label.dateOfBirth',
    defaultMessage: 'Date of Birth',
    description: 'Parent Date of Birth'
  },
  nationality: {
    id: 'certificate.parent.details.label.nationality',
    defaultMessage: 'Nationality',
    description: 'Parent Nationality'
  },
  typeOfID: {
    id: 'certificate.parent.details.label.typeOfID',
    defaultMessage: 'Type of ID',
    description: 'Parent Type of ID'
  },
  number: {
    id: 'certificate.parent.details.label.number',
    defaultMessage: 'Number',
    description: 'Parent number'
  },
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

interface IDynamicCertificateMessages {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
}

const dynamicMessagesToDefine = {
  birthService: {
    id: 'print.certificate.birthService',
    defaultMessage:
      'Service: <strong>Birth registration after {service} of D.o.B.</strong><br/>Amount Due:',
    description: 'Amount due on certificate for birth label'
  },
  deathService: {
    id: 'print.certificate.deathService',
    defaultMessage:
      'Service: <strong>Death registration after {service} of D.o.D.</strong><br/>Amount Due:',
    description: 'Amount due on certificate for death label'
  }
}

export const messages: ICertificateMessages = defineMessages(messagesToDefine)
export const dynamicMessages: IDynamicCertificateMessages = defineMessages(
  dynamicMessagesToDefine
)
