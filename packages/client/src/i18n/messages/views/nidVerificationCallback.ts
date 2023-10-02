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

interface INidVerfificationCallBackMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  authenticatingNid: MessageDescriptor
  failedToAuthenticateNid: MessageDescriptor
}

const messagesToDefine: INidVerfificationCallBackMessages = {
  authenticatingNid: {
    defaultMessage: 'Authenticating National ID',
    id: 'misc.nidCallback.authenticatingNid',
    description: 'Label for nid authention ongoing phase'
  },
  failedToAuthenticateNid: {
    defaultMessage: 'Failed to authenticate National ID',
    id: 'misc.nidCallback.failedToAuthenticateNid',
    description: 'Label for nid authention failed phase'
  }
}

export const messages: INidVerfificationCallBackMessages =
  defineMessages(messagesToDefine)
