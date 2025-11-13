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
import IframeResizer from 'iframe-resizer-react'
import { useIntl } from 'react-intl'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Button } from '@opencrvs/components/lib/Button'
import { AppBar, Frame } from '@opencrvs/components'
import { constantsMessages } from '@client/i18n/messages'
import { ROUTES } from '@client/v2-events/routes'
import {
  NavigationStack,
  useNavigationHistory
} from '@client/v2-events/components/NavigationStack'

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

function DashboardEmbedView({ title, url, icon }: IdashboardView) {
  const intl = useIntl()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { eventId, slug, eventType, workqueue, ...rest } = Object.fromEntries(
    searchParams.entries()
  )
  const history = useNavigationHistory()

  const handleCrossBar = () => {
    if (history.length > 1) {
      const previousLocation = history[history.length - 2]
      navigate(previousLocation.pathname + previousLocation.search)
    } else {
      // Fallback to home if no previous location
      navigate(ROUTES.V2.path)
    }
  }

  return (
    <>
      <Frame
        header={
          <AppBar
            desktopLeft={icon}
            desktopRight={
              <Button
                size="medium"
                type="icon"
                onClick={() => handleCrossBar()}
              >
                <Icon color="primary" name="X" />
              </Button>
            }
            desktopTitle={title}
            mobileLeft={icon}
            mobileRight={
              <Button
                size="medium"
                type="icon"
                onClick={() => handleCrossBar()}
              >
                <Icon color="primary" name="X" />
              </Button>
            }
            mobileTitle={title}
          />
        }
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
      >
        <StyledIFrame allowFullScreen id={title} src={url} />
      </Frame>
    </>
  )
}

export const PerformanceDashboard = () => {
  const intl = useIntl()
  const params = useParams()
  const id = params.id
  const config = window.config.DASHBOARDS.find((d) => d.id === id)
  if (!config) {
    // If no dashboard config found for the given id, render nothing
    return null
  }
  return (
    <NavigationStack>
      <DashboardEmbedView
        icon={<Icon name="Activity" size="medium" />}
        title={intl.formatMessage(config.title)}
        url={config.url}
      />
    </NavigationStack>
  )
}
