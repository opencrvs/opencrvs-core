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

import React from 'react'
import { Icon } from '@opencrvs/components/lib/Icon'
import { DashboardEmbedView } from '@client/views/Performance/Dashboard'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/dashboard'

export const Leaderboards = () => {
  const intl = useIntl()
  return (
    <DashboardEmbedView
      title={intl.formatMessage(messages.leaderboardTitle)}
      url={window.config.LEADERBOARDS_DASHBOARD_URL}
      icon={<Icon name="Medal" size="medium" />}
    />
  )
}
