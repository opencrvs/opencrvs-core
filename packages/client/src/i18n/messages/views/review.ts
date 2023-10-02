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
import { defineMessages } from 'react-intl'

const messagesToDefine = {
  hideLabel: {
    defaultMessage: 'Hide',
    description: 'Button to hide section',
    id: 'form.field.hideLabel'
  },
  showLabel: {
    defaultMessage: 'Show',
    description: 'Button to show section',
    id: 'form.field.showLabel'
  },
  validateCompleteDeclarationActionTitle: {
    id: 'validate.complete.declaration.action.title',
    defaultMessage: 'Send for approval or reject?'
  },
  validateCompleteDeclarationActionDescription: {
    id: 'validate.complete.declaration.action.description',
    defaultMessage:
      'By sending for approval you confirm that the declaration is ready for approval'
  },
  validateDeclarationActionModalTitle: {
    id: 'validate.declaration.action.modal.title',
    defaultMessage: 'Send for approval?'
  },
  validateDeclarationActionModalDescription: {
    id: 'validate.declaration.action.modal.description',
    defaultMessage:
      'This declaration will be sent to the registrar for them to register'
  },
  informantsSignature: {
    defaultMessage: 'Signature of informant',
    description: 'Label for informants signature input',
    id: 'review.inputs.informantsSignature'
  },
  brideSignature: {
    defaultMessage: 'Signature of Bride',
    description: 'Label for informants signature input',
    id: 'review.inputs.brideSignature'
  },
  groomSignature: {
    defaultMessage: 'Signature of Groom',
    description: 'Label for informants signature input',
    id: 'review.inputs.groomSignature'
  },
  witnessOneSignature: {
    defaultMessage: 'Signature of Witness 1',
    description: 'Label for informants signature input',
    id: 'review.inputs.witnessOneSignature'
  },
  witnessTwoSignature: {
    defaultMessage: 'Signature of Witness 2',
    description: 'Label for informants signature input',
    id: 'review.inputs.witnessTwoSignature'
  },

  terms: {
    defaultMessage:
      'We, the undersigned declare under penalty of perjury under the laws of Farajaland that the forgoing information is true and correct to the best of our knowledge and belief. We further declare that no legal objections to the marriage is known and hereby apply for a certificate of marriage',
    description: 'Label for signature terms',
    id: 'review.inputs.terms'
  },
  signatureDescription: {
    defaultMessage:
      'I, the undersigned, hereby declare that the particulars in this form are true and correct to the best of my knowledge.',
    description: 'Label awknowledging the correctness of the declaration',
    id: 'review.signature.description'
  },
  signatureInputDescription: {
    defaultMessage:
      'By signing this document with an electronic signature, I agree that such signature will be valid as handwritten signatures to the extent allowed by the laws of Farajaland.',
    description: 'Description awknowledging the correctness of the declaration',
    id: 'review.signature.input.description'
  },
  signatureOpenSignatureInput: {
    defaultMessage: 'Sign',
    description: 'Label for button that opens the signature input',
    id: 'review.signature.open'
  },
  signatureDelete: {
    defaultMessage: 'Delete',
    description: 'Label for button that deletes signature',
    id: 'review.signature.delete'
  },
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
  editDeclarationConfirmationTitle: {
    defaultMessage: 'Edit declaration?',
    description: 'Edit modal confirmation title',
    id: 'review.edit.modal.confirmationTitle'
  },
  editDeclarationConfirmation: {
    defaultMessage: 'A record will be created of any changes you make.',
    description: 'Edit modal confirmation text',
    id: 'review.edit.modal.confirmationText'
  },
  editDocuments: {
    defaultMessage: 'Add attachement',
    description: 'Edit documents text',
    id: 'review.documents.editDocuments'
  },
  headerSubjectWithName: {
    defaultMessage:
      '{name} {eventType, select, birth {Birth} death {Death} other {Marriage} } declaration',
    description:
      'Header subject that shows which declaration type to review with informant name',
    id: 'review.header.subject.subjectWitName'
  },
  headerSubjectWithoutName: {
    defaultMessage:
      '{eventType, select, birth {Birth} death {Death} other {Marriage}} declaration',
    description: 'Header subject that shows which declaration type to review',
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
      'By registering you confirm that you have reviewed this declaration and satisfied it fulfils requirements required for registration. ',
    id: 'review.actions.description'
  },
  registerActionDescriptionComplete: {
    defaultMessage:
      'By clicking register, you confirm that the information is correct and has been reviewed by the informant. The informant understands that it will be used to register the {eventType, select, birth {birth declaration} death {death declaration}} and for planning purposes.\n\nBy registering this {eventType, select, birth {birth declaration} death {death declaration}}, a {eventType, select, birth {birth} death {death}} certificate will be generated with your signature for issuance.',
    id: 'review.actions.desc.regConfComp'
  },
  registerActionDescriptionIncomplete: {
    defaultMessage:
      'Mandatory information is missing. Please add this information so that you can complete the registration process.',
    id: 'review.actions.desc.regConfInComp'
  },
  registerActionTitle: {
    defaultMessage: 'Ready to register?',
    id: 'review.actions.title.registerActionTitle'
  },
  registerConfirmationTitle: {
    defaultMessage: 'Register the {event}?',
    description: 'Title for register confirmation modal',
    id: 'review.modal.title.registerConfirmation'
  },
  approvalActionDescriptionComplete: {
    defaultMessage:
      'By sending for approval you confirm that the declaration is ready for approval.',
    description:
      'Description for review action component when complete declaration',
    id: 'misc.description.Complete'
  },
  approvalActionDescriptionIncomplete: {
    defaultMessage:
      'Mandatory information is missing. Please add this information so that you can send for approval.',
    id: 'misc.description.inComplete'
  },
  approvalActionTitle: {
    defaultMessage:
      'Send for {draftStatus, select, true {approval} false {approval or reject}}?',
    description: 'Title for review action component',
    id: 'misc.title.declarationStatus'
  },
  reviewActionDescriptionComplete: {
    defaultMessage:
      'By sending this declaration for review you confirm that the information has been reviewed by the informant and that they are aware that they will receive an {deliveryMethod} with a tracking ID and details of how to collect the {eventType, select, birth {birth} death {death}} certificate',
    description:
      'Description for review action component when complete declaration',
    id: 'review.actions.description.confirmComplete'
  },
  reviewActionDescriptionIncomplete: {
    defaultMessage:
      'By sending this incomplete declaration, there will be a digital record made.\n\nTell the informant that they will receive an {deliveryMethod} with a tracking ID. They will need this to complete the declaration at a registration office within 30 days. The informant will need to provide all mandatory information before the {eventType, select, birth {birth declaration} death {death declaration}} can be registered.',
    description:
      'Description for review action component when incomplete declaration',
    id: 'review.actions.description.confirmInComplete'
  },
  reviewActionTitle: {
    defaultMessage:
      'Declaration {completeDeclaration, select, true {complete} false {incomplete}}',
    description: 'Title for review action component',
    id: 'review.actions.title.declarationStatus'
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
      '{completeDeclaration, select, true {This declaration will be sent to the registrar for them to review.} false {This declaration will be sent to the Registrar for completion. Please inform the Informant that they will need to visit the office with the missing information and supporting documents.}}',
    description: 'Submit description text on modal',
    id: 'review.modal.desc.submitConfirmation'
  },
  submitConfirmationTitle: {
    defaultMessage:
      '{completeDeclaration, select, true {Send declaration for review?} false {Send incomplete declaration?}}',
    description: 'Submit title text on modal',
    id: 'review.modal.title.submitConfirmation'
  },
  supportingDocuments: {
    defaultMessage: 'Supporting documents',
    description: 'Section heading title for supporting documents',
    id: 'review.inputs.supportingDocuments'
  },
  validateConfirmationDesc: {
    defaultMessage:
      'This declaration will be sent to the registrar for them to approve.',
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
      'No supporting documents for {section, select, child {child} mother {mother} father {father} deceased {deceased} informant {informant} primaryCaregiver {parents}}',
    description: 'Zero documents text',
    id: 'review.documents.zeroDocumentsText'
  },
  zeroDocumentsTextForAnySection: {
    defaultMessage: 'No supporting documents',
    description: 'Zero documents text',
    id: 'review.documents.zeroDocumentsTextForAnySection'
  },
  govtName: {
    id: 'review.header.title.govtName',
    defaultMessage: 'Government of the peoples republic of Bangladesh',
    description: 'Header title that shows bgd govt name'
  },
  clear: {
    defaultMessage: 'Clear',
    description: 'Label for button that clear signature input',
    id: 'review.signature.clear'
  }
}

export const messages = defineMessages(messagesToDefine)
