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
  monthlyTabTitle: {
    id: 'performance.topbar.tab.title.monthly',
    defaultMessage: 'Monthly',
    description: 'Title used for monthly tab in performance page header'
  },
  monthlyReportsBodyHeader: {
    id: 'performance.body.header.monthly.reports',
    defaultMessage: 'Monthly reports',
    description: 'Header used for the body of monthly reports page'
  },
  sysAdminHomeHeader: {
    id: 'performance.header.sysadmin.home',
    defaultMessage: 'Search for an administrative area or office',
    description: 'Header for system admin performance home page'
  },
  noResultForLocation: {
    id: 'performance.reports.noResultForLocation',
    defaultMessage:
      'No data for {searchedLocation}. We are currently piloting for two upazillas:',
    description: 'Message to show if no data is found for a location'
  },
  exportAll: {
    id: 'performance.reports.exportAll',
    defaultMessage: 'Export all performance data',
    description: 'Link text where all performance data is downloaded from'
  }
}

export const messages = defineMessages(messagesToDefine)
