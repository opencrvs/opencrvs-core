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

interface IRegisterMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  goToReviewButton: MessageDescriptor
  saveDeclarationConfirmModalTitle: MessageDescriptor
  saveDeclarationConfirmModalDescription: MessageDescriptor
  deleteDeclarationConfirmModalTitle: MessageDescriptor
}

const messagesToDefine: IRegisterMessages = {
  goToReviewButton: {
    id: 'register.selectVitalEvent.goToReviewButton',
    defaultMessage: 'Go to review'
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
}

export const messages: IRegisterMessages = defineMessages(messagesToDefine)
