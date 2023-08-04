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

interface IRegisterMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  newVitalEventRegistration: MessageDescriptor
  previewEventRegistration: MessageDescriptor
  reviewEventRegistration: MessageDescriptor
  submitDescription: MessageDescriptor
  registerFormQueryError: MessageDescriptor
  backToReviewButton: MessageDescriptor
  saveDeclarationConfirmModalTitle: MessageDescriptor
  saveDeclarationConfirmModalDescription: MessageDescriptor
  deleteDeclarationConfirmModalTitle: MessageDescriptor
  deleteDeclarationConfirmModalDescription: MessageDescriptor
  exitWithoutSavingDeclarationConfirmModalTitle: MessageDescriptor
  exitWithoutSavingDeclarationConfirmModalDescription: MessageDescriptor
}

const messagesToDefine: IRegisterMessages = {
  newVitalEventRegistration: {
    id: 'register.form.newVitalEventRegistration',
    defaultMessage:
      '{event, select, birth {Birth} death {Death} marriage {Marriage} divorce {Divorce} adoption {Adoption}} declaration',
    description: 'The message that appears for new vital event registration'
  },
  previewEventRegistration: {
    id: 'register.form.previewEventRegistration',
    defaultMessage:
      '{event, select, birth {Birth} death {Death} marriage {Marriage} divorce {Divorce} adoption {Adoption}} Declaration Preview',
    description: 'The message that appears for new birth registrations'
  },
  reviewEventRegistration: {
    id: 'register.form.reviewEventRegistration',
    defaultMessage:
      '{event, select, birth {Birth} death {Death} marriage {Marriage} divorce {Divorce} adoption {Adoption}} Declaration Review',
    description: 'The message that appears for new birth registrations'
  },
  submitDescription: {
    id: 'register.form.modal.submitDescription',
    defaultMessage:
      'By clicking “Submit” you confirm that the informant has read and reviewed the information and understands that this information will be shared with Civil Registration authorities.',
    description: 'Submit description text on submit modal'
  },
  registerFormQueryError: {
    id: 'register.registerForm.queryError',
    defaultMessage:
      'The page cannot be loaded at this time due to low connectivity or a network error. Please click refresh to try again, or try again later.',
    description: 'The error message shown when a search query fails'
  },
  backToReviewButton: {
    id: 'register.selectVitalEvent.backToReviewButton',
    defaultMessage: 'Back to review'
  },
  saveDeclarationConfirmModalTitle: {
    id: 'register.form.modal.title.saveDeclarationConfirm',
    defaultMessage: 'Save & exit?',
    description: 'Title for save declaration confirmation modal'
  },
  saveDeclarationConfirmModalDescription: {
    id: 'register.form.modal.desc.saveDeclarationConfirm',
    defaultMessage:
      'All inputted data will be kept secure for future editing. Are you ready to save any changes to this declaration form?',
    description: 'Description for save declaration confirmation modal'
  },
  deleteDeclarationConfirmModalTitle: {
    id: 'register.form.modal.title.deleteDeclarationConfirm',
    defaultMessage: 'Delete draft?',
    description: 'Title for delete declaration confirmation modal'
  },
  deleteDeclarationConfirmModalDescription: {
    id: 'register.form.modal.desc.deleteDeclarationConfirm',
    defaultMessage: `Are you certain you want to delete this draft declaration form? Please note, this action can't be undone.`,
    description: 'Description for delete declaration confirmation modal'
  },
  exitWithoutSavingDeclarationConfirmModalTitle: {
    id: 'register.form.modal.title.exitWithoutSavingDeclarationConfirm',
    defaultMessage: 'Exit without saving changes?',
    description: 'Title for exit declaration without saving confirmation modal'
  },
  exitWithoutSavingDeclarationConfirmModalDescription: {
    id: 'register.form.modal.desc.exitWithoutSavingDeclarationConfirm',
    defaultMessage:
      'You have unsaved changes on your declaration form. Are you sure you want to exit without saving?',
    description:
      'Description for exit declaration without saving confirmation modal'
  }
}

export const messages: IRegisterMessages = defineMessages(messagesToDefine)
