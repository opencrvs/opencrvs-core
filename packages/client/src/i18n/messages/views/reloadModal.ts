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

interface IReloadModalMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  title: MessageDescriptor
  body: MessageDescriptor
  update: MessageDescriptor
}

const messagesToDefine: IReloadModalMessages = {
  title: {
    id: 'reloadmodal.title',
    defaultMessage: 'Update available',
    description: 'Title when update is available'
  },
  body: {
    id: 'reloadmodal.body',
    defaultMessage:
      'There’s a new version of {app_name} available. Please update to continue.',
    description: 'Body of reload modal'
  },
  update: {
    id: 'reloadmodal.button.update',
    defaultMessage: 'Update',
    description: 'Label of update button'
  }
}
export const messages: IReloadModalMessages = defineMessages(messagesToDefine)
