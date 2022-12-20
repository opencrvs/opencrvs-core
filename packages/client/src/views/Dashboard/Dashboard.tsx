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
import * as React from 'react'
import { useDispatch } from 'react-redux'
import { EventTopBar } from '@opencrvs/components/lib/interface'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/dashboard'
import { goToHome } from '@client/navigation'
import IframeResizer from 'iframe-resizer-react'
import styled from '@client/styledComponents'
import { FullBodyContent } from '@opencrvs/components/lib/layout'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import { FullScreen as FullScreenIcon } from '@opencrvs/components/lib/icons'
const StyledIFrame = styled(IframeResizer)`
  width: 100%;
  height: 100%;
  border: none;
`
export function Dashboard() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const handle = useFullScreenHandle()

  return (
    <>
      <EventTopBar
        menuItems={[
          {
            label: 'Full screen',
            icon: <FullScreenIcon />,
            handler: () => handle.enter()
          }
        ]}
        title={intl.formatMessage(messages.headerTitle)}
        pageIcon={<div />}
        goHome={() => dispatch(goToHome())}
      />
      <FullScreen handle={handle}>
        <FullBodyContent>
          {!window.config.DASHBOARD_EMBED_URL && (
            <h1>Dashboard URL configuration missing</h1>
          )}
          {window.config.DASHBOARD_EMBED_URL && (
            <StyledIFrame
              src={window.config.DASHBOARD_EMBED_URL}
              allowFullScreen
            />
          )}
        </FullBodyContent>
      </FullScreen>
    </>
  )
}
