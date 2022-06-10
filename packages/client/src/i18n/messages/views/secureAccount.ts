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

interface ISecureAccountMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  secureAccountPageTitle: MessageDescriptor
  secureAccountPageDesc: MessageDescriptor
  createPin: MessageDescriptor
}

const messagesToDefine: ISecureAccountMessages = {
  secureAccountPageTitle: {
    id: 'secureAccount.page.title',
    defaultMessage: 'Secure your Account',
    description: 'Title for Secure Account page'
  },
  secureAccountPageDesc: {
    id: 'secureAccount.page.desc',
    defaultMessage:
      'A personal identification number protects your account. Your pin will be required before each use of the {applicationName} app',
    description: 'Description for Secure Account page'
  },
  createPin: {
    id: 'secureAccount.createPin.label',
    defaultMessage: 'CREATE A PIN',
    description: 'Label for create pin button'
  }
}

export const secureAccountMessages: ISecureAccountMessages =
  defineMessages(messagesToDefine)
