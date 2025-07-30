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
import { useNavigate } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { AppBar, Button, Frame, Icon, Stack } from '@opencrvs/components'
import { Plus } from '@opencrvs/components/src/icons'
import { ROUTES } from '@client/v2-events/routes'
import { ProfileMenu } from '@client/components/ProfileMenu'
import * as routes from '@client/navigation/routes'
import { useWorkqueueConfigurations } from '@client/v2-events/features/events/useWorkqueueConfiguration'
import { advancedSearchMessages } from '@client/v2-events/features/events/Search/AdvancedSearch'
import { SearchToolbar } from '@client/v2-events/features/events/components/SearchToolbar'
import { Hamburger } from '../sidebar/Hamburger'
import { Sidebar } from '../sidebar/Sidebar'

/**
 * Basic frame for the workqueues. Includes the left navigation and the app bar.
 */

export function WorkqueueLayout({ children }: { children: React.ReactNode }) {
  const { slug: workqueueSlug } = useTypedParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const navigate = useNavigate()
  const intl = useIntl()
  const workqueues = useWorkqueueConfigurations()

  const workqueueConfig = workqueues.find(({ slug }) => slug === workqueueSlug)

  return (
    <Frame
      header={
        <AppBar
          desktopCenter={
            <Stack gap={16}>
              <Button
                id="header-new-event"
                type="iconPrimary"
                onClick={() => {
                  navigate(ROUTES.V2.EVENTS.CREATE.path)
                }}
              >
                <Plus />
              </Button>

              <SearchToolbar />
            </Stack>
          }
          desktopRight={<ProfileMenu key="profileMenu" />}
          mobileLeft={<Hamburger />}
          mobileRight={
            <Button type={'icon'} onClick={() => navigate(routes.SEARCH)}>
              <Icon color="primary" name="MagnifyingGlass" size="medium" />
            </Button>
          }
          mobileTitle={intl.formatMessage(
            workqueueConfig?.name ?? advancedSearchMessages.advancedSearch
          )}
        />
      }
      navigation={<Sidebar key={workqueueSlug} />}
      skipToContentText="skip"
    >
      {children}
    </Frame>
  )
}
