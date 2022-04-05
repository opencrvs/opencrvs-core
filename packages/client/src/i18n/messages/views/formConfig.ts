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

interface IFormConfigMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  contentKey: MessageDescriptor
  certificateHandlebars: MessageDescriptor
  hideFields: MessageDescriptor
  requiredForRegistration: MessageDescriptor
}

const messagesToDefine: IFormConfigMessages = {
  contentKey: {
    id: 'formConfig.formTools.contentKey',
    defaultMessage: 'Content Key',
    description: 'Content key label for formTools'
  },
  certificateHandlebars: {
    id: 'formConfig.formTools.certificateHandlebars',
    defaultMessage: 'Certificate handlebars',
    description: 'Certificate handlebars label for formTools'
  },
  hideFields: {
    id: 'formConfig.formTools.hideFields',
    defaultMessage: 'Hide field',
    description: 'Hide field label for formTools'
  },
  requiredForRegistration: {
    id: 'formConfig.formTools.requiredForRegistration',
    defaultMessage: 'Required for registration',
    description: 'Required for registration label for formTools'
  }
}

export const messages: IFormConfigMessages = defineMessages(messagesToDefine)
