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
import { defineMessages } from 'react-intl'

const messagesToDefine = {
  weeklyTabTitle: {
    id: 'performance.topbar.tab.title.weekly',
    defaultMessage: 'Weekly',
    description: 'Title used for weekly tab in performance page header'
  },
  weeklyReportsBodyHeader: {
    id: 'performance.body.header.weekly.reports',
    defaultMessage: 'Weekly reports',
    description: 'Header used for the body of weekly reports page'
  },
  noResultForLocation: {
    id: 'performance.reports.noResultForLocation',
    defaultMessage:
      'No data for {searchedLocation}. We are currently piloting for two upazillas:',
    description: 'Message to show if no data is found for a location'
  }
}

export const messages = defineMessages(messagesToDefine)
