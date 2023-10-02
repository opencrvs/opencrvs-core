/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { defineMessages, MessageDescriptor } from 'react-intl'

interface ICertificateMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  certificateCollectionTitle: MessageDescriptor
  addAnotherSignature: MessageDescriptor
  certificateConfirmationTxt: MessageDescriptor
  certificateIsCorrect: MessageDescriptor
  certificateReceiptHeader: MessageDescriptor
  certificateReceiptSubHeader: MessageDescriptor
  collectPayment: MessageDescriptor
  correctorIDCheckDialogDescription: MessageDescriptor
  dateOfBirth: MessageDescriptor
  familyName: MessageDescriptor
  familyNameInEng: MessageDescriptor
  father: MessageDescriptor
  firstName: MessageDescriptor
  firstNameInEng: MessageDescriptor
  idCheckDialogCancel: MessageDescriptor
  idCheckDialogConfirm: MessageDescriptor
  idCheckDialogDescription: MessageDescriptor
  idCheckDialogTitle: MessageDescriptor
  idCheckForCorrectionTitle: MessageDescriptor
  idCheckTitle: MessageDescriptor
  idCheckVerify: MessageDescriptor
  idCheckWithoutVerify: MessageDescriptor
  informant: MessageDescriptor
  informantHasReviewedInformaiton: MessageDescriptor
  manualPaymentMethod: MessageDescriptor
  mother: MessageDescriptor
  nationality: MessageDescriptor
  next: MessageDescriptor
  noLabel: MessageDescriptor
  number: MessageDescriptor
  other: MessageDescriptor
  payment: MessageDescriptor
  noPayment: MessageDescriptor
  paymentInstruction: MessageDescriptor
  paymentAmount: MessageDescriptor
  paymentMethod: MessageDescriptor
  preview: MessageDescriptor
  print: MessageDescriptor
  printCertificate: MessageDescriptor
  printReceipt: MessageDescriptor
  receiptIssuedAt: MessageDescriptor
  receiptIssuer: MessageDescriptor
  receiptPaidAmount: MessageDescriptor
  receiptService: MessageDescriptor
  selectSignature: MessageDescriptor
  service: MessageDescriptor
  amountDue: MessageDescriptor
  typeOfID: MessageDescriptor
  whoToCollect: MessageDescriptor
  confirmAndPrint: MessageDescriptor
  reviewTitle: MessageDescriptor
  reviewDescription: MessageDescriptor
  printModalTitle: MessageDescriptor
  printAndIssueModalTitle: MessageDescriptor
  printModalBody: MessageDescriptor
  printAndIssueModalBody: MessageDescriptor
  toastMessage: MessageDescriptor
  otherCollectorFormTitle: MessageDescriptor
  certificateCollectorError: MessageDescriptor
  certificateOtherCollectorInfoError: MessageDescriptor
  certificateOtherCollectorAffidavitFormTitle: MessageDescriptor
  certificateOtherCollectorAffidavitError: MessageDescriptor
  certificateOtherCollectorAffidavitFormParagraph: MessageDescriptor
  noSignedAffidavitAvailable: MessageDescriptor
  noAffidavitModalTitle: MessageDescriptor
  noAffidavitModalDescription: MessageDescriptor
  signedAffidavitFileLabel: MessageDescriptor
  printedOnCollection: MessageDescriptor
  printedOnAdvance: MessageDescriptor
  collectorIDCheck: MessageDescriptor
}

const messagesToDefine: ICertificateMessages = {
  addAnotherSignature: {
    defaultMessage: 'Add another',
    id: 'print.certificate.addAnotherSignature'
  },
  certificateCollectionTitle: {
    defaultMessage: 'Certify record',
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
  correctorIDCheckDialogDescription: {
    id: 'correction.corrector.description',
    defaultMessage:
      'Please be aware that if you proceed, you will be responsible for making a change to this record without the necessary proof of identification',
    description:
      'The description for the dialog when details of the corrector not verified'
  },
  dateOfBirth: {
    defaultMessage: 'Date of Birth',
    description: 'Parent Date of Birth',
    id: 'certificate.parent.details.label.dateOfBirth'
  },
  familyName: {
    defaultMessage: 'Last Name',
    description: 'Parent last name',
    id: 'certificate.parent.details.label.familyName'
  },
  familyNameInEng: {
    defaultMessage: 'Last Name(in english)',
    description: 'Parent last name',
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
    id: 'print.cert.coll.id.actions.cancel'
  },
  idCheckDialogConfirm: {
    defaultMessage: 'SEND',
    description:
      'The for the dialog when details of the collector not verified',
    id: 'print.cert.coll.id.actions.send'
  },
  idCheckDialogDescription: {
    defaultMessage:
      'Please be aware that if you proceed, you will be responsible for issuing a certificate without the necessary proof of ID from the collector',
    description:
      'The description for the dialog when details of the collector not verified',
    id: 'print.cert.coll.id.description'
  },
  idCheckDialogTitle: {
    defaultMessage: 'Print without proof of ID?',
    description:
      'The title for the dialog when details of the collector not verified',
    id: 'print.certificate.collector.idCheckDialog.title'
  },
  idCheckForCorrectionTitle: {
    id: 'correction.summary.idCheckForCorrection',
    defaultMessage: 'Correct without proof of ID?',
    description:
      'The title for the dialog when details of the collector not verified for correction'
  },
  idCheckTitle: {
    defaultMessage: 'Check proof of ID',
    description: 'The title for id check component',
    id: 'print.certificate.collector.idCheck.title'
  },
  idCheckVerify: {
    defaultMessage: 'ID verified',
    description: 'The label for id check component action when verify details',
    id: 'print.cert.coll.idCheck.actions.ver'
  },
  idCheckWithoutVerify: {
    defaultMessage: 'No ID match',
    description:
      'The label for id check component action when does not verify details',
    id: 'print.cert.coll.idCheck.actions.noVer'
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
    defaultMessage: 'Collect payment',
    description: 'The title for payment section',
    id: 'print.certificate.payment'
  },
  noPayment: {
    defaultMessage: 'No payment required',
    description: 'The title for no payment section',
    id: 'print.certificate.noPayment'
  },
  paymentInstruction: {
    defaultMessage:
      'Please collect the payment, print the receipt and hand it over to the payee.',
    description: 'Description for payment section',
    id: 'print.certificate.paymentInstruction'
  },
  paymentAmount: {
    defaultMessage: '{paymentAmount}',
    description: 'The label for payment amount subsection',
    id: 'print.certificate.paymentAmount'
  },
  paymentMethod: {
    defaultMessage: 'Payment method',
    description: 'The label for payment method select',
    id: 'print.certificate.paymentMethod'
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
    defaultMessage: 'Service',
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
  amountDue: {
    defaultMessage: 'Fee',
    description: 'The label for due amount',
    id: 'certificate.receipt.amountDue'
  },
  typeOfID: {
    defaultMessage: 'Type of ID',
    description: 'Parent Type of ID',
    id: 'certificate.parent.details.label.typeOfID'
  },
  whoToCollect: {
    defaultMessage: 'Certificate collector',
    description: 'The label for collector of certificate select',
    id: 'print.certificate.collector.whoToCollect'
  },
  confirmAndPrint: {
    defaultMessage: 'Yes, print certificate',
    description: 'The text for print button',
    id: 'print.certificate.button.confirmPrint'
  },
  reviewTitle: {
    defaultMessage: 'Ready to certify?',
    description: 'Certificate review title',
    id: 'print.certificate.review.title'
  },
  reviewDescription: {
    defaultMessage:
      'Please confirm that the informant has reviewed that the information on the certificate is correct and that it is ready to print.',
    description: 'Certificate review description',
    id: 'print.certificate.review.description'
  },
  printModalTitle: {
    id: 'print.certificate.review.printModalTitle',
    defaultMessage: 'Print certificate?',
    description: 'Print certificate modal title text'
  },
  printAndIssueModalTitle: {
    id: 'print.certificate.review.printAndIssueModalTitle',
    defaultMessage: 'Print and issue certificate?',
    description: 'Print and issue certificate modal title text'
  },
  printModalBody: {
    id: 'print.certificate.review.modal.body.print',
    defaultMessage:
      'A PDF of the certificate will open in a new tab for you to print. This record will then be moved to your ready to issue work-queue',
    description: 'Print certificate modal body text'
  },
  printAndIssueModalBody: {
    id: 'print.certificate.review.modal.body.printAndIssue',
    defaultMessage:
      'A PDF of the certificate will open in a new tab for you to print and issue',
    description: 'Print certificate modal body text'
  },
  toastMessage: {
    id: 'print.certificate.toast.message',
    defaultMessage: 'Certificate is ready to print',
    description: 'Floating Toast message upon certificate ready to print'
  },
  otherCollectorFormTitle: {
    defaultMessage: 'Collector details',
    description: 'Title for other collector form',
    id: 'print.certificate.collector.other.title'
  },
  certificateCollectorError: {
    defaultMessage: 'Please select who is collecting the certificate',
    description: 'Form level error for collector form',
    id: 'print.certificate.collector.form.error'
  },
  certificateOtherCollectorInfoError: {
    defaultMessage: 'Complete all the mandatory fields',
    description: 'Form level error for other collector information form',
    id: 'print.certificate.collector.other.form.error'
  },
  certificateOtherCollectorAffidavitFormTitle: {
    defaultMessage: 'Upload signed affidavit',
    description: 'Form title for other collector affidavit form',
    id: 'print.cert.coll.other.aff.form.title'
  },
  certificateOtherCollectorAffidavitError: {
    defaultMessage:
      'Upload signed affidavit or click the checkbox if they do not have one.',
    description: 'Form level error for other collector affidavit form',
    id: 'print.cert.coll.other.aff.error'
  },
  certificateOtherCollectorAffidavitFormParagraph: {
    defaultMessage:
      'This document should clearly prove that the individual has the authority to collect the certificate',
    description: 'Form paragraph for other collector affidavit form',
    id: 'print.cert.coll.other.aff.paragraph'
  },
  noSignedAffidavitAvailable: {
    defaultMessage: 'No signed affidavit available',
    description: 'Label for no affidavit checkbox',
    id: 'print.cert.coll.other.aff.check'
  },
  noAffidavitModalTitle: {
    defaultMessage: 'Print without signed affidavit?',
    description:
      'Modal title for other coller form submission without signed affidavit',
    id: 'print.cert.coll.other.aff.title'
  },
  noAffidavitModalDescription: {
    defaultMessage:
      'Please be aware that if you proceed, you will be responsible for issuing a certificate without necessary evidence from the collector',
    description:
      'Modal description for other coller form submission without signed affidavit',
    id: 'print.cert.coll.other.aff.description'
  },
  signedAffidavitFileLabel: {
    defaultMessage: 'Signed affidavit',
    description: 'File label for signed affidavit',
    id: 'print.cert.coll.other.aff.label'
  },
  printedOnCollection: {
    defaultMessage: 'Printed on collection',
    description: 'Table column header showing collector info in record audit',
    id: 'record.certificate.collector'
  },
  printedOnAdvance: {
    defaultMessage: 'Printed in advance by',
    description: 'Table column header showing collector info in record audit',
    id: 'record.certificate.collectedInAdvance'
  },
  collectorIDCheck: {
    defaultMessage: 'ID Check',
    description:
      'Table column header showing collector ID verification info in record audit',
    id: 'correction.summary.idCheck'
  }
}

interface IDynamicCertificateMessages {
  [key: string]: MessageDescriptor
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
  },
  birthServiceBefore: {
    id: 'certificate.receipt.birthService.before',
    defaultMessage: 'Birth registration before {target} days of date of birth',
    description: 'Amount due on certificate for birth label before target days'
  },
  birthServiceAfter: {
    id: 'certificate.receipt.birthService.after',
    defaultMessage: 'Birth registration after {target} days of date of birth',
    description: 'Amount due on certificate for birth label'
  },
  deathServiceBefore: {
    id: 'certificate.receipt.deathService.before',
    defaultMessage: 'Death registration before {target} days of date of death',
    description: 'Amount due on certificate for death label before target days'
  },
  deathServiceAfter: {
    id: 'certificate.receipt.deathService.after',
    defaultMessage: 'Death registration after {target} days of date of death',
    description: 'Amount due on certificate for death label'
  },
  marriageServiceBefore: {
    id: 'certificate.receipt.marriageService.before',
    defaultMessage:
      'Marriage registration before {target} days of date of marriage',
    description:
      'Amount due on certificate for marriage label before target days'
  },
  marriageServiceAfter: {
    id: 'certificate.receipt.marriageService.after',
    defaultMessage:
      'Marriage registration after {target} days of date of marriage',
    description: 'Amount due on certificate for marriage label'
  },
  birthServiceBetween: {
    id: 'certificate.receipt.birthService.between',
    defaultMessage:
      'Birth registration between {target} days and {latetarget} days of date of birth',
    description: 'Amount due on certificate for birth label'
  }
}

export const messages: ICertificateMessages = defineMessages(messagesToDefine)
export const dynamicMessages: IDynamicCertificateMessages = defineMessages(
  dynamicMessagesToDefine
)
