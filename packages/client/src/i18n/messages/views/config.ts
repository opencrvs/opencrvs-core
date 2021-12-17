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

interface IConfigMessages {
  applicationSettings: MessageDescriptor
  certificateConfiguration: MessageDescriptor
}

const messagesToDefine: IConfigMessages = {
  applicationSettings: {
    id: 'config.applicationSettings',
    defaultMessage: 'Application settings',
    description: 'Link Text for Config Application Settings'
  },
  certificateConfiguration: {
    id: 'config.certificateConfiguration',
    defaultMessage: 'Certificate configuration',
    description: 'Link Text for Config Application Settings'
  }
}

export const messages: IConfigMessages = defineMessages(messagesToDefine)
