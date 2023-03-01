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

interface IDashboardMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  noContent: MessageDescriptor
  dashboardTitle: MessageDescriptor
  leaderboardTitle: MessageDescriptor
  statisticTitle: MessageDescriptor
}

const messagesToDefine: IDashboardMessages = {
  noContent: {
    defaultMessage: 'No Content',
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
    defaultMessage: 'Statitics',
    description: 'Statitics title',
    id: 'dashboard.statisticTitle'
  }
}

export const messages: IDashboardMessages = defineMessages(messagesToDefine)
