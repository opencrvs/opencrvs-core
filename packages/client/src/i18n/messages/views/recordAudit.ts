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

interface IRecordAuditMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  reinstateDeclarationDialogTitle: MessageDescriptor
  reinstateDeclarationDialogCancel: MessageDescriptor
  reinstateDeclarationDialogConfirm: MessageDescriptor
  reinstateDeclarationDialogDescription: MessageDescriptor
}

const messagesToDefine: IRecordAuditMessages = {
  reinstateDeclarationDialogTitle: {
    id: 'recordAudit.declaration.reinstateDialogTitle',
    defaultMessage: 'Reinstate declaration?',
    description: 'Title for the dialog when reinstate declaration'
  },
  reinstateDeclarationDialogCancel: {
    id: 'recordAudit.declaration.reinstateDialog.actions.cancel',
    defaultMessage: 'Cancel',
    description: 'Button label for the dialog when cancel reinstate declaration'
  },
  reinstateDeclarationDialogConfirm: {
    id: 'recordAudit.declaration.reinstateDialog.actions.confirm',
    defaultMessage: 'Confirm',
    description:
      'Button label for the dialog when confirm reinstate declaration'
  },
  reinstateDeclarationDialogDescription: {
    id: 'recordAudit.declaration.reinstateDialogDescription',
    defaultMessage:
      'This will revert the application back to its original status and add it to your workqueue.',
    description: 'Description for the dialog when reinstate declaration'
  }
}

export const messages: IRecordAuditMessages = defineMessages(messagesToDefine)
