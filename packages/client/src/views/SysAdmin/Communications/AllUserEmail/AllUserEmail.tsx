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
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { Content } from '@opencrvs/components/lib/Content'
import { messages } from '@client/i18n/messages/views/config'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Navigation } from '@client/components/interface/Navigation'
import { constantsMessages } from '@client/i18n/messages'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { HistoryNavigator } from '@client/components/Header/HistoryNavigator'
import { ProfileMenu } from '@client/components/ProfileMenu'

const AllUserEmail = () => {
  const intl = useIntl()
  return (
    <>
      <Frame
        header={
          <AppBar
            desktopLeft={<HistoryNavigator />}
            desktopRight={<ProfileMenu key="profileMenu" />}
            mobileLeft={<HistoryNavigator hideForward />}
            mobileTitle={intl.formatMessage(messages.emailAllUsersTitle)}
          />
        }
        navigation={<Navigation />}
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
      >
        <Content
          title={intl.formatMessage(messages.emailAllUsersTitle)}
          titleColor={'copy'}
          subtitle={intl.formatMessage(messages.emailAllUsersSubtitle)}
        ></Content>
      </Frame>
    </>
  )
}

export default AllUserEmail
