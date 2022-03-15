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

interface IReviewMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  additionalComments: MessageDescriptor
  backToPreview: MessageDescriptor
  editDeclarationConfirmationTitle: MessageDescriptor
  editDeclarationConfirmation: MessageDescriptor
  editDocuments: MessageDescriptor
  formDataHeader: MessageDescriptor
  headerSubjectWithName: MessageDescriptor
  headerSubjectWithoutName: MessageDescriptor
  previewName: MessageDescriptor
  previewTitle: MessageDescriptor
  registerActionDescription: MessageDescriptor
  registerActionDescriptionComplete: MessageDescriptor
  registerActionDescriptionIncomplete: MessageDescriptor
  registerActionTitle: MessageDescriptor
  registerConfirmationTitle: MessageDescriptor
  approvalActionDescriptionComplete: MessageDescriptor
  approvalActionDescriptionIncomplete: MessageDescriptor
  approvalActionTitle: MessageDescriptor
  reviewActionDescriptionComplete: MessageDescriptor
  reviewActionDescriptionIncomplete: MessageDescriptor
  reviewActionTitle: MessageDescriptor
  reviewName: MessageDescriptor
  reviewTitle: MessageDescriptor
  submitConfirmationDesc: MessageDescriptor
  submitConfirmationTitle: MessageDescriptor
  validateConfirmationDesc: MessageDescriptor
  validateConfirmationTitle: MessageDescriptor
  valueApprove: MessageDescriptor
  zeroDocumentsText: MessageDescriptor
  validateCompleteDeclarationActionTitle: MessageDescriptor
  validateCompleteDeclarationActionDescription: MessageDescriptor
  validateDeclarationActionModalTitle: MessageDescriptor
  validateDeclarationActionModalDescription: MessageDescriptor
  govtName: MessageDescriptor
  documentForWhom: MessageDescriptor
}

const messagesToDefine: IReviewMessages = {
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
  formDataHeader: {
    defaultMessage:
      '{isDraft, select, true {Check responses with the informant before sending for review} false {Review the answers with the supporting documents}}',
    description: 'Label for form data header text',
    id: 'review.formData.header'
  },
  headerSubjectWithName: {
    defaultMessage:
      '{eventType, select, birth {Birth} death {Death} other {Birth}} Declaration for {name}',
    description:
      'Header subject that shows which declaration type to review with informant name',
    id: 'review.header.subject.subjectWitName'
  },
  headerSubjectWithoutName: {
    defaultMessage:
      '{eventType, select, birth {Birth} death {Death}} Declaration',
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
    defaultMessage: 'Register this {event}?',
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
      'By sending this declaration for review you confirm that the information has been reviewed by the informant and that they are aware that they will receive an SMS with a tracking ID and details of how to collect the {eventType, select, birth {birth} death {death}} certificate',
    description:
      'Description for review action component when complete declaration',
    id: 'review.actions.description.confirmComplete'
  },
  reviewActionDescriptionIncomplete: {
    defaultMessage:
      'By sending this incomplete declaration, there will be a digital record made.\n\nTell the informant that they will receive an SMS with a tracking ID. They will need this to complete the declaration at a registration office within 30 days. The informant will need to provide all mandatory information before the {eventType, select, birth {birth declaration} death {death declaration}} can be registered.',
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
  govtName: {
    id: 'review.header.title.govtName',
    defaultMessage: 'Government of the peoples republic of Bangladesh',
    description: 'Header title that shows bgd govt name'
  },
  documentForWhom: {
    defaultMessage: `{section, select, child {Child's} mother {Mother's} father {Father's} deceased {Deceased's} informant {Informant's} informant {Informant's} primaryCaregiver {Parents' } parent {Parents' } other {}}`,
    description: 'Describes for whom the document has been uploaded',
    id: 'review.documents.documentForWhom'
  }
}

export const messages: IReviewMessages = defineMessages(messagesToDefine)
