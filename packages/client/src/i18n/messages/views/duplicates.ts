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

interface IDuplicateDeclarationMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  duplicateReviewHeader: MessageDescriptor
}

const messagesToDefine: IDuplicateDeclarationMessages = {
  duplicateReviewHeader: {
    id: 'duplicates.review.header',
    defaultMessage: 'Potential {event} duplicate review',
    description: 'Review page header for duplicates declarations'
  }
}

export const duplicateMessages: IDuplicateDeclarationMessages =
  defineMessages(messagesToDefine)
