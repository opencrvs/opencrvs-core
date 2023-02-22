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
import { connect, useDispatch } from 'react-redux'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import { injectIntl } from 'react-intl'
import { AppBar, Content, Frame } from '@opencrvs/components'
import { Activity } from '@opencrvs/components/lib/icons'
import { goBack } from '@client/navigation'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'

function dashboardComponent() {
  const dispatch = useDispatch()
  return (
    <>
      <Frame
        header={
          <AppBar
            desktopTitle="Dashboard"
            desktopLeft={<Activity />}
            desktopRight={
              <Button
                type="icon"
                size="medium"
                onClick={() => dispatch(goBack())}
              >
                <Icon name="X" color="primary" />
              </Button>
            }
            mobileLeft={<Activity />}
            mobileRight={
              <Button
                type="icon"
                size="medium"
                onClick={() => dispatch(goBack())}
              >
                <Icon name="X" color="primary" />
              </Button>
            }
            mobileTitle="Statistics"
          />
        }
        skipToContentText="Skip to main content"
      >
        {window.config && window.config.REGISTRATIONS_DASHBOARD_URL ? (
          <iframe src={window.config.REGISTRATIONS_DASHBOARD_URL}></iframe>
        ) : (
          <Content title="Dashboard" size="large"> No Content </Content>
        )}
      </Frame>
    </>
  )
}
export const PerformanceDashboard = connect((state: IStoreState) =>
  getOfflineData(state)
)(injectIntl(dashboardComponent))
