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
import { AppBar, Frame } from '@opencrvs/components'
import { ProfileMenu } from '@client/components/ProfileMenu'
import { SearchToolbar } from '@client/v2-events/features/events/components/SearchToolbar'
import { HistoryNavigator } from '@client/components/Header/HistoryNavigator'
import { constantsMessages } from '@client/i18n/messages/constants'
import { Sidebar } from '../sidebar/Sidebar'
import { DesktopCenter } from '../workqueues'

export function SearchLayout({ children }: { children: React.ReactNode }) {
  const intl = useIntl()
  return (
    <Frame
      header={
        <AppBar
          desktopCenter={<DesktopCenter />}
          desktopRight={<ProfileMenu key="profileMenu" />}
          mobileCenter={<SearchToolbar />}
          mobileLeft={<HistoryNavigator hideForward />}
        />
      }
      navigation={<Sidebar key={'search-result'} />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      {children}
    </Frame>
  )
}
