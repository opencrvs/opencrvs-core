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
  reload: MessageDescriptor
  notNow: MessageDescriptor
  newContent: MessageDescriptor
  versionDoesNotMatch: MessageDescriptor
}

const messagesToDefine: IReloadModalMessages = {
  reload: {
    id: 'reloadmodal.button.reload',
    defaultMessage: 'Relaod',
    description: 'Label for reload button'
  },
  notNow: {
    id: 'reloadmodal.button.notnow',
    defaultMessage: 'Not now',
    description: 'Label for not now button'
  },
  newContent: {
    id: 'reloadmodal.title.newcontent',
    defaultMessage:
      'New content available. Please reload to get the latest client',
    description: 'Title when new content is available'
  },
  versionDoesNotMatch: {
    id: 'reloadmodal.title.versionMismatch',
    defaultMessage:
      'Version does not match. please refer to the log for more details',
    description: 'Title when versions does not match'
  }
}
export const messages: IReloadModalMessages = defineMessages(messagesToDefine)
