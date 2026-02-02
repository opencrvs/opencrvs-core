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

import React, { useEffect, useRef, useState } from 'react'
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
import { getToken } from '@client/utils/authUtils'

const StyledIFrame = styled(IframeResizer)`
  width: 100%;
  height: 100%;
  border: none;
`
interface IdashboardView {
  dashboard: {
    context?: {
      auth: 'REQUEST_AUTH_TOKEN'
    }
    title: {
      id: string
      defaultMessage: string
      description: string
    }
    url: string
  }
  icon?: JSX.Element
}

function isValidAbsoluteURL(value: string): boolean {
  try {
    const url = new URL(value)
    return url.origin !== 'null'
  } catch {
    return false
  }
}

function DashboardEmbedView({ dashboard, icon }: IdashboardView) {
  const intl = useIntl()
  const title = intl.formatMessage(dashboard.title)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { eventId, slug, eventType, workqueue, ...rest } = Object.fromEntries(
    searchParams.entries()
  )
  const history = useNavigationHistory()
  const token = getToken()

  const handleCrossBar = () => {
    if (history.length > 1) {
      const previousLocation = history[history.length - 2]
      navigate(previousLocation.pathname + previousLocation.search)
    } else {
      // Fallback to home if no previous location
      navigate(ROUTES.V2.path)
    }
  }

  // ---- Send token to wrapper iframe when ready ----
  useEffect(() => {
    if (!token || dashboard.context?.auth !== 'REQUEST_AUTH_TOKEN') {
      return
    }

    if (!isValidAbsoluteURL(dashboard.url)) {
      throw new Error(`Invalid dashboard URL: ${dashboard.url}`)
    }

    const dashboardOrigin = new URL(dashboard.url).origin
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== dashboardOrigin) {
        return
      }

      // this is the real sender window
      const sourceWindow = event.source as Window | null
      if (!sourceWindow) {
        return
      }

      if (event.data?.type === 'REQUEST_AUTH_TOKEN') {
        sourceWindow.postMessage({ type: 'AUTH_TOKEN', token }, event.origin)
      }
    }

    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [dashboard.context?.auth, dashboard.url, token])

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
        {
          <StyledIFrame
            ref={iframeRef}
            allowFullScreen
            id={title}
            src={dashboard.url}
          />
        }
      </Frame>
    </>
  )
}

export const PerformanceDashboard = () => {
  const params = useParams()
  const id = params.id
  const dashboard = window.config.DASHBOARDS.find((d) => d.id === id)
  if (!dashboard) {
    // If no dashboard config found for the given id, render nothing
    return null
  }
  return (
    <NavigationStack>
      <DashboardEmbedView
        dashboard={dashboard}
        icon={<Icon name="Activity" size="medium" />}
      />
    </NavigationStack>
  )
}
