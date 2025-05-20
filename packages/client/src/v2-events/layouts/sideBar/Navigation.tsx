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

import * as React from 'react'
import { IntlShape, useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { Icon } from '@opencrvs/components/lib/Icon'
import { LogoutNavigation } from '@opencrvs/components/lib/icons/LogoutNavigation'
import { SettingsNavigation } from '@opencrvs/components/lib/icons/SettingsNavigation'
import { LeftNavigation } from '@opencrvs/components/lib/SideNavigation/LeftNavigation'
import { NavigationGroup } from '@opencrvs/components/lib/SideNavigation/NavigationGroup'
import { NavigationItem } from '@opencrvs/components/lib/SideNavigation/NavigationItem'
import { findScope } from '@opencrvs/commons/client'
import { buttonMessages } from '@client/i18n/messages'
import { getScope } from '@client/profile/profileSelectors'
import { storage } from '@client/storage'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { useWorkqueueConfigurations } from '@client/v2-events/features/events/useWorkqueueConfiguration'
import { ROUTES } from '@client/v2-events/routes'
import { removeToken } from '@client/utils/authUtils'
import * as routes from '@client/navigation/routes'
import { removeUserDetails } from '@client/utils/userUtils'
import { constantsMessages } from '@client/v2-events/messages'

const SCREEN_LOCK = 'screenLock'

export const Navigation = ({
  menuCollapse,
  navigationWidth,
  userInfo
}: {
  menuCollapse?: () => void
  navigationWidth?: number
  userInfo?: {
    name: string
    role: string
    avatar: React.JSX.Element
  }
}) => {
  const { slug: workqueueSlug } = useTypedParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const intl = useIntl()
  const workqueues = useWorkqueueConfigurations()
  const scopes = useSelector(getScope)
  const navigate = useNavigate()

  const runningVer = String(localStorage.getItem('running-version'))
  const availableWorkqueues =
    findScope(scopes ?? [], 'workqueue')?.options.id ?? []

  return (
    <LeftNavigation
      applicationName={intl.formatMessage(constantsMessages.applicationName)} // @todo Should come from country config
      applicationVersion={runningVer}
      avatar={() => userInfo && userInfo.avatar}
      name={userInfo && userInfo.name}
      navigationWidth={navigationWidth}
      role={userInfo && userInfo.role}
    >
      <NavigationGroup>
        {workqueues
          .filter(({ slug }) => availableWorkqueues.includes(slug))
          .map(({ name, slug, icon }) => (
            <NavigationItem
              key={slug}
              count={7}
              icon={() => <Icon name={icon} size="small" />}
              id={`navigation_workqueue_${slug}`}
              isSelected={slug === workqueueSlug}
              label={intl.formatMessage(name)}
              onClick={() => {
                navigate(
                  ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: slug })
                )
                menuCollapse && menuCollapse()
              }}
            />
          ))}
      </NavigationGroup>
      <NavigationGroup>
        <NavigationItem
          icon={() => <SettingsNavigation />}
          id={`navigation_${WORKQUEUE_TABS.settings}`}
          isSelected={false}
          label={intl.formatMessage(buttonMessages[WORKQUEUE_TABS.settings])}
          onClick={() => {
            navigate(routes.SETTINGS)
            menuCollapse && menuCollapse()
          }}
        />
        <NavigationItem
          icon={() => <LogoutNavigation />}
          id={`navigation_${WORKQUEUE_TABS.logout}`}
          label={intl.formatMessage(buttonMessages[WORKQUEUE_TABS.logout])}
          onClick={async () => {
            await storage.removeItem(SCREEN_LOCK)
            removeToken()
            await removeUserDetails()
            window.location.assign(window.config.LOGIN_URL) // how to preserve language
          }}
        />
      </NavigationGroup>
    </LeftNavigation>
  )
}
