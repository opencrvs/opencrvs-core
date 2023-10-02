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

interface IDashboardMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  noContent: MessageDescriptor
  dashboardTitle: MessageDescriptor
  leaderboardTitle: MessageDescriptor
  statisticTitle: MessageDescriptor
}

const messagesToDefine: IDashboardMessages = {
  noContent: {
    defaultMessage: `No content to show.
    Make sure the following variables are configured in the <strong>client-config.js</strong> provided by your country config package:<br />
    <ul>
      <li><strong>LEADERBOARDS_DASHBOARD_URL</strong></li>
      <li><strong>REGISTRATIONS_DASHBOARD_URL</strong></li>
      <li><strong>STATISTICS_DASHBOARD_URL</strong></li>
    </ul>`,
    description: 'No content information for dashboard',
    id: 'dashboard.noContent'
  },
  dashboardTitle: {
    defaultMessage: 'Dashboard',
    description: 'Dashboard title',
    id: 'dashboard.dashboardTitle'
  },
  leaderboardTitle: {
    defaultMessage: 'Leaderboards',
    description: 'Leaderboards title',
    id: 'dashboard.leaderboardTitle'
  },
  statisticTitle: {
    defaultMessage: 'Statistics',
    description: 'Statistics title',
    id: 'dashboard.statisticTitle'
  }
}

export const messages: IDashboardMessages = defineMessages(messagesToDefine)
