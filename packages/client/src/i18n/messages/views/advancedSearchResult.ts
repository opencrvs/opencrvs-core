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

export type IAdvancedSearchResultMessages = {
  event: MessageDescriptor
  trackingId: MessageDescriptor
  gender: MessageDescriptor
  noResult: MessageDescriptor
}

const messagesToDefine: IAdvancedSearchResultMessages = {
  event: {
    defaultMessage: 'Event',
    description: 'The label for event param in active advancedSearchParams',
    id: 'advancedSearchResult.pill.event'
  },
  trackingId: {
    defaultMessage: 'Tracking ID',
    description: 'The label for tracking id in active advancedSearchParams',
    id: 'advancedSearchResult.pill.trackingId'
  },
  gender: {
    defaultMessage: 'Sex',
    description: 'The label for gender in active advancedSearchParams',
    id: 'advancedSearchResult.pill.gender'
  },
  noResult: {
    defaultMessage: 'No result',
    description: 'The label for no result in advancedSearchResult page',
    id: 'advancedSearchResult.table.noResult'
  }
}
const messages: IAdvancedSearchResultMessages =
  defineMessages(messagesToDefine)
