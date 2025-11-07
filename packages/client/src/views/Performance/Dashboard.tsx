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

import { constantsMessages } from '@client/i18n/messages'
import { generatePerformanceHomeUrl } from '@client/navigation'
import { getUserDetails } from '@client/profile/profileSelectors'
import { AppBar, Frame } from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import IframeResizer from 'iframe-resizer-react'
import React from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

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

export const DashboardEmbedView = ({ title, url, icon }: IdashboardView) => {
  const intl = useIntl()
  const userDetails = useSelector(getUserDetails)
  const location = useLocation()
  const navigate = useNavigate()
  const handleCrossBar = () => {
    const navigatedFromInsideApp = Boolean(
      location.state && location.state.isNavigatedInsideApp
    )
    if (navigatedFromInsideApp) {
      navigate(-1)
    } else {
      navigate(
        generatePerformanceHomeUrl({
          locationId: userDetails?.primaryOffice.id
        })
      )
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
        <StyledIFrame id={title} src={url} allowFullScreen />
      </Frame>
    </>
  )
}

export const PerformanceDashboard = () => {
  const intl = useIntl()
  const params = useParams()
  const id = params.id
  const config = window.config.DASHBOARDS.find((d) => d.id === id)!
  return (
    <DashboardEmbedView
      title={intl.formatMessage(config.title)}
      url={config.url}
      icon={<Icon name="Activity" size="medium" />}
    />
  )
}
