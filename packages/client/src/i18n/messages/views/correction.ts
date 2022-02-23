/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { defineMessages, MessageDescriptor } from 'react-intl'

interface ICorrectionMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  whoRequestedCorrection: MessageDescriptor
  title: MessageDescriptor
  name: MessageDescriptor
  correctorError: MessageDescriptor
  mother: MessageDescriptor
  father: MessageDescriptor
  child: MessageDescriptor
  legalGuardian: MessageDescriptor
  anotherRegOrFieldAgent: MessageDescriptor
  me: MessageDescriptor
  court: MessageDescriptor
  others: MessageDescriptor
  informant: MessageDescriptor
  whatWasTheReasonForCorrection: MessageDescriptor
  reasonForChange: MessageDescriptor
  additionalComment: MessageDescriptor
  clericalError: MessageDescriptor
  materialError: MessageDescriptor
  materialOmission: MessageDescriptor
  judicialOrder: MessageDescriptor
  reasonForChangeError: MessageDescriptor
  idCheckTitle: MessageDescriptor
  otherIdCheckTitle: MessageDescriptor
  idCheckVerify: MessageDescriptor
  birthCorrectionNote: MessageDescriptor
  proofOfLegalDocuments: MessageDescriptor
  docTypeAffidavitProof: MessageDescriptor
  docTypeCourtDocument: MessageDescriptor
  docTypeOther: MessageDescriptor
  supportDocumentForCorrection: MessageDescriptor
  selectPlaceholder: MessageDescriptor
  attestToSeeCorrectionDocument: MessageDescriptor
  noDocumentsRequiredForCorrection: MessageDescriptor
  supportingDocumentsTitle: MessageDescriptor
  supportingDocumentsSubtitle: MessageDescriptor
  correctionSummaryTitle: MessageDescriptor
  correctionSummaryItem: MessageDescriptor
  correctionSummaryOriginal: MessageDescriptor
  correctionSummaryCorrection: MessageDescriptor
  correctionSummaryRequestedBy: MessageDescriptor
  correctionSummaryIdCheck: MessageDescriptor
  correctionSummaryReasonForRequest: MessageDescriptor
  correctionSummaryComments: MessageDescriptor
  correctionSummaryAddComments: MessageDescriptor
  correctionSummaryFeesRequired: MessageDescriptor
  correctionSummaryProofOfPaymentRequired: MessageDescriptor
  correctionSummaryProofOfPayment: MessageDescriptor
}

const messagesToDefine: ICorrectionMessages = {
  whoRequestedCorrection: {
    id: 'correction.corrector.title',
    defaultMessage: 'Who is requesting a change to this record?',
    description: 'The title for the corrector form'
  },
  name: {
    id: 'correction.name',
    defaultMessage: 'Correction',
    description: 'Certificate correction section name'
  },
  title: {
    id: 'correction.title',
    defaultMessage: 'Correct record',
    description: 'Certificate correction section title'
  },
  correctorError: {
    id: 'correction.corrector.error',
    defaultMessage: 'Please select who is correcting the certificate',
    description: 'Error for corrector form'
  },
  mother: {
    id: 'correction.corrector.mother',
    defaultMessage: 'Mother',
    description: 'Label for mother option in certificate correction form'
  },
  father: {
    id: 'correction.corrector.father',
    defaultMessage: 'Father',
    description: 'Label for father option in certificate correction form'
  },
  child: {
    id: 'correction.corrector.child',
    defaultMessage: 'Child',
    description: 'Label for child option in certificate correction form'
  },
  legalGuardian: {
    id: 'correction.corrector.legalGuardian',
    defaultMessage: 'Legal guardian',
    description:
      'Label for legal guardian option in certificate correction form'
  },
  anotherRegOrFieldAgent: {
    id: 'correction.corrector.anotherAgent',
    defaultMessage: 'Another registration agent or field agent',
    description:
      'Label for another registration or field agent option in certificate correction form'
  },
  me: {
    id: 'correction.corrector.me',
    defaultMessage: 'Me (Registrar)',
    description: 'Label for registrar option in certificate correction form'
  },
  court: {
    id: 'correction.corrector.court',
    defaultMessage: 'Court',
    description: 'Label for court option in certificate correction form'
  },
  others: {
    id: 'correction.corrector.others',
    defaultMessage: 'Someone else',
    description: 'Label for someone else option in certificate correction form'
  },
  informant: {
    id: 'correction.corrector.informant',
    defaultMessage: 'Informant',
    description: 'Label for informant option in certificate correction form'
  },
  whatWasTheReasonForCorrection: {
    id: 'correction.reason.title',
    defaultMessage: 'What was the reason for making a correction?',
    description: 'The title for the correction reason form'
  },
  reasonForChange: {
    id: 'correction.reason.reasonForChange',
    defaultMessage: 'Reason for change',
    description: 'Label for other reason for correction reason form'
  },
  additionalComment: {
    id: 'correction.reason.additionalComment',
    defaultMessage: 'Any additional comment?',
    description: 'Label for any additional comment for correction reason form'
  },
  clericalError: {
    id: 'correction.reason.clericalError',
    defaultMessage: 'Myself or an agent made a mistake (Clerical error)',
    description: 'Label for clerical error for correction reason form'
  },
  materialError: {
    id: 'correction.reason.materialError',
    defaultMessage: 'Applicant provided incorrect information (Material error)',
    description: 'Label for material error for correction reason form'
  },
  materialOmission: {
    id: 'correction.reason.materialOmission',
    defaultMessage:
      'Applicant did not provide this information (Material omission)',
    description: 'Label for material omission for correction reason form'
  },
  judicialOrder: {
    id: 'correction.reason.judicialOrder',
    defaultMessage: 'Requested to do so by the court (Judicial order)',
    description: 'Label for judicial order for correction reason form'
  },
  reasonForChangeError: {
    id: 'correction.reason.error',
    defaultMessage: 'Please type the reason for change',
    description: 'Error for reason form'
  },
  idCheckTitle: {
    id: 'correction.certificate.corrector.idCheck',
    defaultMessage: 'Check proof of ID. Does it match the following details?',
    description: 'The title for id check component'
  },
  otherIdCheckTitle: {
    id: 'correction.certificate.corrector.otherIdCheck',
    defaultMessage: 'Have you checked their proof of identification?',
    description: 'The title for other id check component'
  },
  idCheckVerify: {
    id: 'correction.certificate.corrector.idCheckVerify',
    defaultMessage: 'Yes',
    description: 'The label for id check component action when verify details'
  },
  idCheckWithoutVerify: {
    id: 'correction.certificate.corrector.idCheckWithoutVerify',
    defaultMessage: 'No',
    description:
      'The label for id check component action when does not verify details'
  },
  birthCorrectionNote: {
    id: 'correction.corrector.birth.note',
    defaultMessage:
      'Note: In the case that the child is now of legal age (18) then only they should be able to request a change to thier birth record.',
    description: 'Birth correction note'
  },
  proofOfLegalDocuments: {
    id: 'correction.supportingDocuments.proofOfLegalDocuments',
    defaultMessage: 'Proof of legal correction documents',
    description: 'Label for list item of legal proof'
  },
  docTypeAffidavitProof: {
    id: 'correction.supportingDocuments.docTypeAffidavitProof',
    defaultMessage: 'Affidavit',
    description: 'Label for select option Affidavit'
  },
  docTypeCourtDocument: {
    id: 'correction.supportingDocuments.docTypeCourtDocument',
    defaultMessage: 'Court Document',
    description: 'Label for select option Court Document'
  },
  docTypeOther: {
    id: 'correction.supportingDocuments.docTypeOther',
    defaultMessage: 'Other',
    description: 'Label for select option Other'
  },
  supportDocumentForCorrection: {
    id: 'correction.supportingDocuments.supportDocumentForCorrection',
    defaultMessage: 'Check Supporting Document?',
    description: 'Label for form field: Correction Supporting Document'
  },
  selectPlaceholder: {
    id: 'correction.supportingDocuments.select.placeholder',
    defaultMessage: 'Select',
    description: 'Placeholder text for a select'
  },
  attestToSeeCorrectionDocument: {
    id: 'correction.supportingDocuments.attestToSeeCorrectionDocument',
    defaultMessage:
      'I attest to seeing supporting documentation and have a copy filed at my office',
    description: 'Option for form field: Correction Supporting Document'
  },
  noDocumentsRequiredForCorrection: {
    id: 'correction.supportingDocuments.noDocumentsRequiredForCorrection',
    defaultMessage: 'No supporting documents required',
    description: 'Option for form field: Correction Supporting Document'
  },
  supportingDocumentsTitle: {
    id: 'correction.supportingDocuments.title',
    defaultMessage: 'Upload supporting documents',
    description:
      'Label for supportingDocuments form title in certificate correction form'
  },
  supportingDocumentsSubtitle: {
    id: 'correction.supportingDocuments.subtitle',
    defaultMessage:
      'For all record corrections at a minimum an affidavit must be provided. For material errors and omissions eg. in paternity cases, a court order must also be provided.',
    description:
      'Label for supportingDocuments form subtitle in certificate correction form'
  },
  correctionSummaryTitle: {
    id: 'correction.summary.title',
    defaultMessage: 'Correction summary',
    description: 'Title for certificate correction summary'
  },
  correctionSummaryItem: {
    id: 'correction.summary.item',
    defaultMessage: 'Item',
    description:
      'Corrected item table header for certificate correction summary'
  },
  correctionSummaryOriginal: {
    id: 'correction.summary.original',
    defaultMessage: 'Original',
    description:
      'Original value table header for certificate correction summary'
  },
  correctionSummaryCorrection: {
    id: 'correction.summary.correction',
    defaultMessage: 'Correction',
    description:
      'Correction value table header for certificate correction summary'
  },
  correctionSummaryRequestedBy: {
    id: 'correction.summary.requestedBy',
    defaultMessage: 'Requested by',
    description: 'Requested by header for certificate correction summary'
  },
  correctionSummaryIdCheck: {
    id: 'correction.summary.idCheck',
    defaultMessage: 'ID check',
    description: 'ID check header for certificate correction summary'
  },
  correctionSummaryReasonForRequest: {
    id: 'correction.summary.reasonForRequest',
    defaultMessage: 'Reason for request',
    description: 'Reason for request header for certificate correction summary'
  },
  correctionSummaryComments: {
    id: 'correction.summary.comments',
    defaultMessage: 'Comments',
    description: 'Comments header for certificate correction summary'
  },
  correctionSummaryAddComments: {
    id: 'correction.summary.addComments',
    defaultMessage: 'Add Comments',
    description: 'Add Comments header for certificate correction summary'
  },
  correctionSummarySupportingDocuments: {
    id: 'correction.summary.supportingDocuments',
    defaultMessage: 'Supporting documents',
    description:
      'Supporting documents header for certificate correction summary'
  },
  correctionSummaryFeesRequired: {
    id: 'correction.summary.feesRequired',
    defaultMessage: 'Fees required?',
    description: 'Fees required for certificate correction summary'
  },
  correctionSummaryProofOfPaymentRequired: {
    id: 'correction.summary.proofOfPaymentRequired',
    defaultMessage: 'Proof of payment is required',
    description:
      'Validation for proof of payment document for certificate correction summary'
  },
  correctionSummaryProofOfPayment: {
    id: 'correction.summary.proofOfPayment',
    defaultMessage: 'Proof of payment',
    description: 'Proof of payment label fees payment document'
  }
}

export const messages: ICorrectionMessages = defineMessages(messagesToDefine)
