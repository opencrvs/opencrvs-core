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
import { useNavigate } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { Icon } from '@opencrvs/components/lib/Icon'
import { NavigationGroup } from '@opencrvs/components/lib/SideNavigation/NavigationGroup'
import { NavigationItem } from '@opencrvs/components/lib/SideNavigation/NavigationItem'
import {
  TAB_GROUPS,
  WORKQUEUE_TABS
} from '@client/components/interface/WorkQueueTabs'
import * as routes from '@client/navigation/routes'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { useHasAccessToNavigationItem } from '@client/components/interface/useHasAccessToNavigationItem'
import {
  showLeaderboard,
  showRegDashboard,
  showStatistics
} from '@client/components/interface/Navigation'

/**
 * Based on packages/client/src/components/interface/Navigation.tsx
 *
 * @returns Navigation group for performance-related tabs which link back to V1 performance features.
 */
export function PerformanceNavigationGroup({
  currentWorkqueueSlug
}: {
  currentWorkqueueSlug?: string
}) {
  const navigate = useNavigate()
  const intl = useIntl()

  const { hasAccess } = useHasAccessToNavigationItem()

  return (
    <>
      {hasAccess(TAB_GROUPS.performance) && (
        <NavigationGroup>
          {
            <>
              {showRegDashboard && hasAccess(WORKQUEUE_TABS.dashboard) && (
                <NavigationItem
                  icon={() => <Icon name="ChartLine" size="small" />}
                  id={`navigation_${WORKQUEUE_TABS.dashboard}`}
                  isSelected={currentWorkqueueSlug === 'dashboard'}
                  label={intl.formatMessage(navigationMessages['dashboard'])}
                  onClick={() =>
                    navigate(routes.PERFORMANCE_DASHBOARD, {
                      state: { isNavigatedInsideApp: true }
                    })
                  }
                />
              )}
              {showStatistics && hasAccess(WORKQUEUE_TABS.statistics) && (
                <NavigationItem
                  icon={() => <Icon name="Activity" size="small" />}
                  id={`navigation_${WORKQUEUE_TABS.statistics}`}
                  isSelected={currentWorkqueueSlug === 'statistics'}
                  label={intl.formatMessage(navigationMessages['statistics'])}
                  onClick={() =>
                    navigate(routes.PERFORMANCE_STATISTICS, {
                      state: { isNavigatedInsideApp: true }
                    })
                  }
                />
              )}
              {showLeaderboard && hasAccess(WORKQUEUE_TABS.leaderboards) && (
                <NavigationItem
                  icon={() => <Icon name="Medal" size="small" />}
                  id={`navigation_${WORKQUEUE_TABS.leaderboards}`}
                  isSelected={currentWorkqueueSlug === 'leaderboards'}
                  label={intl.formatMessage(navigationMessages['leaderboards'])}
                  onClick={() =>
                    navigate(routes.PERFORMANCE_LEADER_BOARDS, {
                      state: { isNavigatedInsideApp: true }
                    })
                  }
                />
              )}
            </>
          }
        </NavigationGroup>
      )}
    </>
  )
}
