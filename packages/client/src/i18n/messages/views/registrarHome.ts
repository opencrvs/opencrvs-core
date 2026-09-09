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

interface IOfficeHomeMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  inProgress: MessageDescriptor
  readyForReview: MessageDescriptor
  readyToPrint: MessageDescriptor
  registrationNumber: MessageDescriptor
}

const messagesToDefine: IOfficeHomeMessages = {
  inProgress: {
    defaultMessage: 'In progress',
    description: 'The title of In progress',
    id: 'regHome.inProgress'
  },
  readyForReview: {
    defaultMessage: 'Ready for review',
    description: 'The title of ready for review',
    id: 'regHome.readyForReview'
  },
  readyToPrint: {
    defaultMessage: 'Ready to print',
    description: 'The title of ready to print tab',
    id: 'regHome.readyToPrint'
  },
  registrationNumber: {
    defaultMessage: 'Registration no.',
    description: 'The heading of registration no. column',
    id: 'regHome.registrationNumber'
  },
}

export const messages: IOfficeHomeMessages = defineMessages(messagesToDefine)
