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

import React from 'react'
import { connect } from 'react-redux'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import { injectIntl } from 'react-intl'
import * as Icons from 'react-feather'
import { DashboardEmbedView } from '@client/views/Performance/Dashboard'

const leaderBoardsComponent = () => (
  <DashboardEmbedView
    title={'Leaderboards'}
    url={window.config.LEADERBOARDS_DASHBOARD_URL}
    icon={<Icons.Award width={20} height={20} />}
  />
)

export const LeaderBoards = connect((state: IStoreState) =>
  getOfflineData(state)
)(injectIntl(leaderBoardsComponent))
