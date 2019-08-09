import { defineMessages } from 'react-intl'

interface ICertificateMessages {
  certificateCollectionTitle: ReactIntl.FormattedMessage.MessageDescriptor
  addAnotherSignature: ReactIntl.FormattedMessage.MessageDescriptor
  certificateConfirmationTxt: ReactIntl.FormattedMessage.MessageDescriptor
  certificateIsCorrect: ReactIntl.FormattedMessage.MessageDescriptor
  certificateReceiptHeader: ReactIntl.FormattedMessage.MessageDescriptor
  certificateReceiptSubHeader: ReactIntl.FormattedMessage.MessageDescriptor
  collectPayment: ReactIntl.FormattedMessage.MessageDescriptor
  dateOfBirth: ReactIntl.FormattedMessage.MessageDescriptor
  familyName: ReactIntl.FormattedMessage.MessageDescriptor
  familyNameInEng: ReactIntl.FormattedMessage.MessageDescriptor
  father: ReactIntl.FormattedMessage.MessageDescriptor
  firstName: ReactIntl.FormattedMessage.MessageDescriptor
  firstNameInEng: ReactIntl.FormattedMessage.MessageDescriptor
  idCheckDialogCancel: ReactIntl.FormattedMessage.MessageDescriptor
  idCheckDialogConfirm: ReactIntl.FormattedMessage.MessageDescriptor
  idCheckDialogDescription: ReactIntl.FormattedMessage.MessageDescriptor
  idCheckDialogTitle: ReactIntl.FormattedMessage.MessageDescriptor
  idCheckTitle: ReactIntl.FormattedMessage.MessageDescriptor
  idCheckVerify: ReactIntl.FormattedMessage.MessageDescriptor
  idCheckWithoutVerify: ReactIntl.FormattedMessage.MessageDescriptor
  informant: ReactIntl.FormattedMessage.MessageDescriptor
  informantHasReviewedInformaiton: ReactIntl.FormattedMessage.MessageDescriptor
  manualPaymentMethod: ReactIntl.FormattedMessage.MessageDescriptor
  mother: ReactIntl.FormattedMessage.MessageDescriptor
  nationality: ReactIntl.FormattedMessage.MessageDescriptor
  next: ReactIntl.FormattedMessage.MessageDescriptor
  noLabel: ReactIntl.FormattedMessage.MessageDescriptor
  number: ReactIntl.FormattedMessage.MessageDescriptor
  other: ReactIntl.FormattedMessage.MessageDescriptor
  payment: ReactIntl.FormattedMessage.MessageDescriptor
  paymentAmount: ReactIntl.FormattedMessage.MessageDescriptor
  paymentMethod: ReactIntl.FormattedMessage.MessageDescriptor
  person1: ReactIntl.FormattedMessage.MessageDescriptor
  person2: ReactIntl.FormattedMessage.MessageDescriptor
  preview: ReactIntl.FormattedMessage.MessageDescriptor
  print: ReactIntl.FormattedMessage.MessageDescriptor
  printCertificate: ReactIntl.FormattedMessage.MessageDescriptor
  printReceipt: ReactIntl.FormattedMessage.MessageDescriptor
  receiptIssuedAt: ReactIntl.FormattedMessage.MessageDescriptor
  receiptIssuer: ReactIntl.FormattedMessage.MessageDescriptor
  receiptPaidAmount: ReactIntl.FormattedMessage.MessageDescriptor
  receiptService: ReactIntl.FormattedMessage.MessageDescriptor
  selectSignature: ReactIntl.FormattedMessage.MessageDescriptor
  service: ReactIntl.FormattedMessage.MessageDescriptor
  serviceMonth: ReactIntl.FormattedMessage.MessageDescriptor
  serviceYear: ReactIntl.FormattedMessage.MessageDescriptor
  typeOfID: ReactIntl.FormattedMessage.MessageDescriptor
  whoToCollect: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: ICertificateMessages = {
  addAnotherSignature: {
    defaultMessage: 'Add another',
    id: 'print.certificate.addAnotherSignature'
  },
  certificateCollectionTitle: {
    defaultMessage: 'Certificate Collection',
    description: 'The title of print certificate action',
    id: 'print.certificate.section.title'
  },
  certificateConfirmationTxt: {
    defaultMessage: 'Edit',
    description: 'Edit',
    id: 'certificate.confirmCorrect'
  },
  certificateIsCorrect: {
    defaultMessage: 'Is the {event} certificate correct?',
    description:
      'Question asking the user if the information on the  certificate is correct',
    id: 'certificate.isCertificateCorrect'
  },
  certificateReceiptHeader: {
    defaultMessage: 'Receipt for {event} Certificate of',
    description: 'Receipt header for payment on certificate',
    id: 'certificate.receipt.header'
  },
  certificateReceiptSubHeader: {
    defaultMessage: '{event} Registration after {DOBDiff} of {DOE}',
    description: 'Subheader for receipt on payment on certificate',
    id: 'certificate.receipt.subheader'
  },
  collectPayment: {
    defaultMessage:
      'Please collect the payment, print the receipt and hand it over to the payee.',
    description: 'The label for collect payment paragraph',
    id: 'print.certificate.collectPayment'
  },
  dateOfBirth: {
    defaultMessage: 'Date of Birth',
    description: 'Parent Date of Birth',
    id: 'certificate.parent.details.label.dateOfBirth'
  },
  familyName: {
    defaultMessage: 'Family Name',
    description: 'Parent family name',
    id: 'certificate.parent.details.label.familyName'
  },
  familyNameInEng: {
    defaultMessage: 'Family Name(in english)',
    description: 'Parent family name',
    id: 'certificate.parent.details.label.familyNameInEng'
  },
  father: {
    defaultMessage: 'Father',
    description:
      'The label for select value when father is the collector of certificate',
    id: 'print.certificate.collector.father'
  },
  firstName: {
    defaultMessage: 'First Name(s)',
    description: 'Parent first names',
    id: 'certificate.parent.details.label.firstName'
  },
  firstNameInEng: {
    defaultMessage: 'First Name(s)(in english)',
    description: 'Parent first names',
    id: 'certificate.parent.details.label.firstNameInEng'
  },
  idCheckDialogCancel: {
    defaultMessage: 'Cancel',
    description:
      'The for the dialog when details of the collector not verified',
    id: 'print.certificate.collector.idCheckDialog.actions.cancel'
  },
  idCheckDialogConfirm: {
    defaultMessage: 'SEND',
    description:
      'The for the dialog when details of the collector not verified',
    id: 'print.certificate.collector.idCheckDialog.actions.send'
  },
  idCheckDialogDescription: {
    defaultMessage:
      'Please be aware that if you proceed, you will be responsible for issuing a certificate without the necessary proof of ID from the collector',
    description:
      'The description for the dialog when details of the collector not verified',
    id: 'print.certificate.collector.idCheckDialog.description'
  },
  idCheckDialogTitle: {
    defaultMessage: 'Continue without proof of ID?',
    description:
      'The title for the dialog when details of the collector not verified',
    id: 'print.certificate.collector.idCheckDialog.title'
  },
  idCheckTitle: {
    defaultMessage: 'Check proof of ID. Does it match the following details?',
    description: 'The title for id check component',
    id: 'print.certificate.collector.idCheck.title'
  },
  idCheckVerify: {
    defaultMessage: 'Yes',
    description: 'The label for id check component action when verify details',
    id: 'print.certificate.collector.idCheck.actions.verify'
  },
  idCheckWithoutVerify: {
    defaultMessage: 'No',
    description:
      'The label for id check component action when does not verify details',
    id: 'print.certificate.collector.idCheck.actions.withoutVerify'
  },
  informant: {
    defaultMessage: 'Informant',
    description:
      'The label for select value when informant is the collector of certificate',
    id: 'print.certificate.collector.informant'
  },
  informantHasReviewedInformaiton: {
    defaultMessage:
      'The informant has reviewed and confirmed that the information on the certificate is correct.',
    id: 'print.certificate.userReviewed'
  },
  manualPaymentMethod: {
    defaultMessage: 'Manual',
    description: 'The label for select option for manual payment method',
    id: 'print.certificate.manualPaymentMethod'
  },
  mother: {
    defaultMessage: 'Mother',
    description:
      'The label for select value when mother is the collector of certificate',
    id: 'print.certificate.collector.mother'
  },
  nationality: {
    defaultMessage: 'Nationality',
    description: 'Parent Nationality',
    id: 'certificate.parent.details.label.nationality'
  },
  next: {
    defaultMessage: 'Next',
    description: 'The label for next button',
    id: 'buttons.next'
  },
  noLabel: {
    defaultMessage: ' ',
    id: 'print.certificate.noLabel'
  },
  number: {
    defaultMessage: 'Number',
    description: 'Parent number',
    id: 'certificate.parent.details.label.number'
  },
  other: {
    defaultMessage: 'Other',
    description:
      'The label for select value when the collector of certificate is other person',
    id: 'print.certificate.collector.other'
  },
  payment: {
    defaultMessage: 'Payment',
    description: 'The title for payment section',
    id: 'print.certificate.payment'
  },
  paymentAmount: {
    defaultMessage: '৳ {paymentAmount}',
    description: 'The label for payment amount subsection',
    id: 'print.certificate.paymentAmount'
  },
  paymentMethod: {
    defaultMessage: 'Payment method',
    description: 'The label for payment method select',
    id: 'print.certificate.paymentMethod'
  },
  person1: {
    defaultMessage: 'UP Secretary Shakib al hasan',
    id: 'print.certificate.signature.person1'
  },
  person2: {
    defaultMessage: 'Local Registrar Mohammad Ashraful',
    id: 'print.certificate.signature.person2'
  },
  preview: {
    defaultMessage: 'Certificate Preview',
    description: 'The title for certificate preview form',
    id: 'print.certificate.certificatePreview'
  },
  print: {
    defaultMessage: 'Print certificate',
    description: 'The title of review button in list expansion actions',
    id: 'print.certificate.form.title'
  },
  printCertificate: {
    defaultMessage: 'Print',
    description: 'The title of review button in list expansion actions',
    id: 'print.certificate.form.name'
  },
  printReceipt: {
    defaultMessage: 'Print receipt',
    description: 'The label for print receipt button',
    id: 'print.certificate.printReceipt'
  },
  receiptIssuedAt: {
    defaultMessage: 'Issued at:',
    description: 'Receipt on payment on certificate issued at label',
    id: 'certificate.receipt.issuedAt'
  },
  receiptIssuer: {
    defaultMessage: 'By: {role}, {name}\n Date of payment: {dateOfPayment}',
    description: 'Issuer information for receipt of certificate payment label',
    id: 'certificate.receipt.issuer'
  },
  receiptPaidAmount: {
    defaultMessage: 'Amount paid:\n\n',
    description: 'Amount paid for certificate label',
    id: 'certificate.receipt.amount'
  },
  receiptService: {
    defaultMessage: 'Service:',
    description: 'Service received for receipt label',
    id: 'certificate.receipt.service'
  },
  selectSignature: {
    defaultMessage: 'Select e-signatures',
    description: 'The label for choose signature select',
    id: 'print.certificate.selectSignature'
  },
  service: {
    defaultMessage:
      'Service: <strong>Birth registration after {service, plural, =0 {0 month} one {1 month} other{{service} months}} of D.o.B.</strong><br/>Amount Due:',
    description: 'The label for service paragraph',
    id: 'print.certificate.serviceMonth'
  },
  serviceMonth: {
    defaultMessage:
      'Service: <strong>Birth registration after {service, plural, =0 {0 month} one {1 month} other{{service} months}} of D.o.B.</strong><br/>Amount Due:',
    description: 'The label for service paragraph',
    id: 'print.certificate.serviceMonth'
  },
  serviceYear: {
    defaultMessage:
      'Service: <strong>Birth registration after {service, plural, =0 {0 year} one {1 year} other{{service} years}} of D.o.B.</strong><br/>Amount Due:',
    description: 'The label for service paragraph',
    id: 'print.certificate.serviceYear'
  },
  typeOfID: {
    defaultMessage: 'Type of ID',
    description: 'Parent Type of ID',
    id: 'certificate.parent.details.label.typeOfID'
  },
  whoToCollect: {
    defaultMessage: 'Who is collecting the certificate?',
    description: 'The label for collector of certificate select',
    id: 'print.certificate.collector.whoToCollect'
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
