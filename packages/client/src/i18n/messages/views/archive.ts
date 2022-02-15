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

interface IConfigMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  confirmationTitle: MessageDescriptor
  confirmationBody: MessageDescriptor
}

const messagesToDefine: IConfigMessages = {
  confirmationTitle: {
    id: 'archive.confirmation.title',
    defaultMessage: 'Archive declaration?',
    description: 'Confirmation title for archiving a declaration'
  },
  confirmationBody: {
    id: 'archive.confirmation.body',
    defaultMessage:
      'This will remove the declaration from the workqueue and change the status to Archive. To revert this change you will need to search for the declaration.',
    description: 'Confirmation body for archiving a declaration'
  }
}

export const messages: IConfigMessages = defineMessages(messagesToDefine)
