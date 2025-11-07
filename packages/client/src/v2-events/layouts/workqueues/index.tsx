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
import { useSelector } from 'react-redux'
import { AppBar, Button, Frame, Icon, Stack } from '@opencrvs/components'
import { Plus } from '@opencrvs/components/src/icons'
import { ActionType, isActionInScope } from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { ProfileMenu } from '@client/components/ProfileMenu'
import { SearchToolbar } from '@client/v2-events/features/events/components/SearchToolbar'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useAllWorkqueueConfigurations } from '@client/v2-events/features/events/useAllWorkqueueConfigurations'
import { getScope } from '@client/profile/profileSelectors'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { emptyMessage } from '@client/v2-events/utils'
import { Hamburger } from '../sidebar/Hamburger'
import { Sidebar } from '../sidebar/Sidebar'

export function DesktopCenter() {
  const { createNewDeclaration } = useEventFormNavigation()
  const scopes = useSelector(getScope) ?? []

  const eventConfigurations = useEventConfigurations()
  const mayCreateEvents = eventConfigurations.some(({ id }) =>
    isActionInScope(scopes, ActionType.CREATE, id)
  )

  return (
    <Stack gap={16}>
      {mayCreateEvents && (
        <Button
          disabled={!mayCreateEvents}
          id="header-new-event"
          type="iconPrimary"
          onClick={() => createNewDeclaration()}
        >
          <Plus />
        </Button>
      )}

      <SearchToolbar />
    </Stack>
  )
}

/**
 * Basic frame for the workqueues. Includes the left navigation and the app bar.
 */
export function WorkqueueLayout({
  children,
  title
}: {
  children: React.ReactNode
  title?: string
}) {
  const { slug: workqueueSlug } = useTypedParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const navigate = useNavigate()
  const intl = useIntl()
  const workqueues = useAllWorkqueueConfigurations()
  const workqueueConfig = workqueues.find(({ slug }) => slug === workqueueSlug)

  const scopes = useSelector(getScope) ?? []

  const hasSearchScope = scopes.some((scope) => scope.startsWith('search'))

  return (
    <Frame
      header={
        <AppBar
          desktopCenter={<DesktopCenter />}
          desktopRight={<ProfileMenu key="profileMenu" />}
          mobileLeft={<Hamburger />}
          mobileRight={
            hasSearchScope && (
              <Button
                aria-label="Go to search"
                type={'icon'}
                onClick={() => navigate(ROUTES.V2.SEARCH.buildPath({}))}
              >
                <Icon color="primary" name="MagnifyingGlass" size="medium" />
              </Button>
            )
          }
          mobileTitle={
            title ?? intl.formatMessage(workqueueConfig?.name ?? emptyMessage)
          }
        />
      }
      navigation={<Sidebar key={workqueueSlug} />}
      skipToContentText="skip"
    >
      {children}
    </Frame>
  )
}
