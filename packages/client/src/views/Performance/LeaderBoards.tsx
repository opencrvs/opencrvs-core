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
import * as Icons from 'react-feather'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { goBack } from '@client/navigation'
import styled from '@client/styledComponents'
import IframeResizer from 'iframe-resizer-react'
const StyledIFrame = styled(IframeResizer)`
  width: 100%;
  height: 100%;
  border: none;
`
function leaderBoardsComponent() {
  const dispatch = useDispatch()
  return (
    <>
      <Frame
        header={
          <AppBar
            desktopTitle="Leaderboards"
            desktopLeft={<Icons.Award width={20} height={20} />}
            desktopRight={
              <Button
                type="icon"
                size="medium"
                onClick={() => dispatch(goBack())}
              >
                {' '}
                <Icon name="X" color="primary" />{' '}
              </Button>
            }
            mobileLeft={<Icons.Award width={20} height={20} />}
            mobileRight={
              <Button
                type="icon"
                size="medium"
                onClick={() => dispatch(goBack())}
              >
                {' '}
                <Icon name="X" color="primary" />{' '}
              </Button>
            }
            mobileTitle="Leaderboards"
          />
        }
        skipToContentText="Skip to main content"
      >
        {window.config && window.config.LEADERBOARDS_DASHBOARD_URL ? (
          <StyledIFrame
            src={window.config.LEADERBOARDS_DASHBOARD_URL}
            allowFullScreen
          />
        ) : (
          <Content title="Leaderboards" size="large">
            {' '}
            No Content{' '}
          </Content>
        )}
      </Frame>
    </>
  )
}
export const LeaderBoards = connect((state: IStoreState) =>
  getOfflineData(state)
)(injectIntl(leaderBoardsComponent))
