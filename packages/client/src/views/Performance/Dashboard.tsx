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
import styled from '@client/styledComponents'
import IframeResizer from 'iframe-resizer-react'
const StyledIFrame = styled(IframeResizer)`
  width: 100%;
  height: 100%;
  border: none;
`
interface IdashboardView {
  title: string
  url: string
  icon?: JSX.Element
}

export const DashboardEmbedView = ({ title, url, icon }: IdashboardView) => {
  const dispatch = useDispatch()
  return (
    <>
      <Frame
        header={
          <AppBar
            desktopTitle={title}
            desktopLeft={icon}
            desktopRight={
              <Button
                type="icon"
                size="medium"
                onClick={() => dispatch(goBack())}
              >
                <Icon name="X" color="primary" />
              </Button>
            }
            mobileLeft={icon}
            mobileRight={
              <Button
                type="icon"
                size="medium"
                onClick={() => dispatch(goBack())}
              >
                <Icon name="X" color="primary" />
              </Button>
            }
            mobileTitle={title}
          />
        }
        skipToContentText="Skip to main content"
      >
        {window.config && url ? (
          <StyledIFrame src={url} allowFullScreen />
        ) : (
          <Content title="Dashboard" size="large">
            {' '}
            No Content{' '}
          </Content>
        )}
      </Frame>
    </>
  )
}

const dashboardComponent = () => (
  <DashboardEmbedView
    title={'Dashboard'}
    url={window.config.REGISTRATIONS_DASHBOARD_URL}
    icon={<Activity />}
  />
)

export const PerformanceDashboard = connect((state: IStoreState) =>
  getOfflineData(state)
)(injectIntl(dashboardComponent))
