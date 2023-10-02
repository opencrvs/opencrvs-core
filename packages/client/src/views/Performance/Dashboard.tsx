/* eslint-disable prettier/prettier */
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
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { AppBar, Content, ContentSize, Frame } from '@opencrvs/components'
import { goBack, goToPerformanceHome } from '@client/navigation'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import styled from 'styled-components'
import IframeResizer from 'iframe-resizer-react'
import { messages } from '@client/i18n/messages/views/dashboard'
import { useLocation } from 'react-router'
import { constantsMessages } from '@client/i18n/messages'

const StyledIFrame = styled(IframeResizer)`
  width: 100%;
  height: 100%;
  border: none;
`
interface IdashboardView {
  title: string
  url?: string
  icon?: JSX.Element
}

interface ILocationState {
  isNavigatedInsideApp: boolean
}

export const DashboardEmbedView = ({ title, url, icon }: IdashboardView) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const location = useLocation<ILocationState>()
  const handleCrossBar = () => {
    const navigatedFromInsideApp = Boolean(
      location.state && location.state.isNavigatedInsideApp
    )
    if (navigatedFromInsideApp) {
      dispatch(goBack())
    } else {
      dispatch(goToPerformanceHome())
    }
  }

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
                onClick={() => handleCrossBar()}
              >
                <Icon name="X" color="primary" />
              </Button>
            }
            mobileLeft={icon}
            mobileRight={
              <Button
                type="icon"
                size="medium"
                onClick={() => handleCrossBar()}
              >
                <Icon name="X" color="primary" />
              </Button>
            }
            mobileTitle={title}
          />
        }
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
      >
        {window.config && url ? (
          <StyledIFrame
            id={`${title.toLowerCase()}_main`}
            src={url}
            allowFullScreen
          />
        ) : (
          <div id={`${title.toLowerCase()}_noContent`}>
            <Content title={title} size={ContentSize.LARGE}>
              {intl.formatMessage(messages.noContent, {
                strong: (chunks: any) => <strong>{chunks}</strong>,
                ul: (chunks: any) => <ul>{chunks}</ul>,
                li: (chunks: any) => <li>{chunks}</li>
              })}
            </Content>
          </div>
        )}
      </Frame>
    </>
  )
}

export const PerformanceDashboard = () => {
  const intl = useIntl()
  return (
    <DashboardEmbedView
      title={intl.formatMessage(messages.dashboardTitle)}
      url={window.config.REGISTRATIONS_DASHBOARD_URL}
      icon={<Icon name="Activity" size="medium" />}
    />
  )
}
